import React, {Component} from 'react';
import ViewBase from "../../../components/ViewBase";
import {
    NavLink,
} from "react-router-dom";
import Pagination from "../../../common/components/Pagination"
import Progress from "../../../common/components/Progress"
import Heat from "../../../common/components/Heat"
import Alert from "../../../common/components/Alert"
import LoginController from "../../../class/login/LoginController"
import ProjectController from "../../../class/project/ProjectController"
import UserController from "../../../class/user/UserController";

export default class List extends ViewBase {
    constructor() {
        super();
        this.state = {
            viewMode: 0 ,       // 视图模式 0-列表,1-卡片
            sortByTime: 0 ,      // 时间排序
            tabItem: 0,        //选中tab项, 0-收藏，1-进行中，2-即将开始，3-已结束

            projects: [],
            total: 1,
            curPage: 1,
            pageSize: 20,

            showAlert: false,     //提示框
            alertContent: "",
        };

        //滚动事件,固定tab
        this.onScroll= () => {
            let $content = document.querySelector(".project-list");
            let $tab = document.querySelector('.tab');
            if($content.getBoundingClientRect().top < 0){
                $tab.classList.add("fix");
            }else{
                $tab.classList.remove("fix");
            }
        };
    }

    //收藏
    async toCollectPage(page){
        if(!LoginController().isLogin()){
            this.setState({projects: [], total: 0, curPage: 1});
            return;
        }
        let {pageSize} = this.state;
        let data = await UserController().getCollectList(1, page, pageSize);
        if(data.msg){
            this.setState({projects: [], total: 0, curPage: 1});
            return;
        }
        let {list,total} = data;
        this.setState({projects: list, total: total, curPage: page});
    }

    //进行中，即将开始，已结束
    async toPage(page){
        let {pageSize, tabItem, sortByTime} = this.state;
        if(tabItem === 0){
            this.toCollectPage(page);
            return;
        }
        let data = await ProjectController().getProjectList(page, pageSize, tabItem, sortByTime+1);
        if(data.msg){
          this.setState({projects: [], total: 0, curPage: 1});
          return;
        }
        let {total, list} = data;
        this.setState({projects: list, total: total, curPage: page});
    }

    //添加收藏
    async addCollect(item){
        if(!LoginController().isLogin()){
            this.bus.emit("showLoginDialog");
            return;
        }

        let data = await UserController().setCollect(1, item.id, !item.isCollect);
        if(data.msg){
            this.setState({showAlert: true, alertContent: data.msg});
            return;
        }
        item.isCollect = !item.isCollect;
        let {tabItem, projects} = this.state;
        if(tabItem === 0 && !item.isCollect){
            projects.includes(item) && projects.splice(projects.indexOf(item),1);
        }
        this.setState({showAlert: true, alertContent: item.isCollect ? "收藏成功" : "取消收藏成功"});
    }

    async componentDidMount() {
        let tab = parseInt(this.getQuery("tab")) || 1;
        this.setState({
            tabItem: tab
          }, ()=> this.toPage(1));
        window.addEventListener("scroll", this.onScroll);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.onScroll);
    }

    render() {
        let {history} = this.props;
        let {viewMode, sortByTime, tabItem, total, curPage, pageSize} = this.state;
        let {showAlert, alertContent} = this.state;
        let projectList = this.state.projects || [];
        //是否登录
        let isLogin = LoginController().isLogin();
        //是否显示空数据提示
        let showLoginEmpty = (tabItem === 0 && !isLogin);
        let showEmpty = (tabItem === 0 && isLogin && projectList.length<=0) || (tabItem !== 0 && projectList.length<=0);

        return (
            <div className="project-list">
                {/*tab栏*/}
                <div className="tab-wrap">
                    <div className="tab">
                        {/*收藏，进行中，即将开始，已结束*/}
                        <ul className="classify">
                            <li className={tabItem === 0 ? "active" : ""}
                                onClick={()=>this.setState({tabItem: 0},()=> this.toPage(1))}>收藏</li>
                            <li className={tabItem === 1 ? "active" : ""}
                                onClick={()=>this.setState({tabItem: 1},()=> this.toPage(1))}>进行中</li>
                            <li className={tabItem === 2 ? "active" : ""}
                                onClick={()=>this.setState({tabItem: 2},()=> this.toPage(1))}>即将开始</li>
                            <li className={tabItem === 3 ? "active" : ""}
                                onClick={()=>this.setState({tabItem: 3},()=> this.toPage(1))}>已结束</li>
                        </ul>
                        {/*列表视图，卡片视图*/}
                        <ul className="view">
                            <li className={`v-list ${viewMode === 0 ? "active" : ""}`} onClick={()=>this.setState({viewMode:0})}/>
                            <li className={`v-card ${viewMode === 1 ? "active" : ""}`} onClick={()=>this.setState({viewMode:1})}/>
                        </ul>
                    </div>
                </div>

                {/*项目列表*/}
                {projectList.length>0 &&
                    <div className="table">
                        <div className="thead">
                            <p className="name">项目名称</p>
                            <p className="time sortable"
                               onClick={()=>this.setState({sortByTime: ++sortByTime%3},()=>this.toPage(1))}>
                                时间<i className={["none","up","down"][sortByTime]}/>
                            </p>
                            <p className="price">众筹价格</p>
                            <p className="minmax">目标金额</p>
                            <p className="step">实际进度</p>
                            <p className="coin">接受币种</p>
                            <p className="heat">热度</p>
                            <p className="collect">收藏</p>
                        </div>
                        {projectList.map((item,index)=>
                            <div className="tr" key={index}>
                                {/*项目名称*/}
                                <div className="name">
                                    <img src={item.logo} onClick={()=>history.push(`/project/detail?id=${item.id}`)}/>
                                    <p className="p1">
                                        <a onClick={()=>history.push(`/project/detail?id=${item.id}`)}>
                                          <b>{item.name}</b>
                                          <span>{item.fullName}</span>
                                        </a>
                                    </p>
                                    <p className="p2">
                                        {item.badgeList && item.badgeList.map((item,index2) => <i key={index2}>#{item}#</i>)}
                                    </p>
                                </div>
                                {/*时间*/}
                                <div className="time">
                                    <p>始：{new Date(item.startTime).end()}</p>
                                    <p>终：{new Date(item.endTime).end()}</p>
                                </div>
                                {/*众筹价格*/}
                                <div className="price">
                                    {item.icoPrices && item.icoPrices.map((item,index2)=><p key={index2}>{item}</p>)}
                                </div>
                                {/*目标金额*/}
                                <div className="minmax">
                                    <p>低：{item.minNum} {item.minUnit}</p>
                                    <p>高：{item.maxNum} {item.maxUnit}</p>
                                </div>
                                {/*实际进度*/}
                                {item.type !== 2 ?
                                    <div className="step">
                                      <p>{item.actualNum} {item.actualUnit}</p>
                                      <Progress step={item.step}/>
                                      <i>{item.step}%</i>
                                    </div>
                                    :
                                    <div className="step">
                                      <p>倒计时: {new Date(item.endTime).remain()}</p>
                                    </div>}
                                {/*接受币种*/}
                                <div className="coin">
                                    <p>
                                      {item.recvCoin && item.recvCoin.map((item,index2)=><span key={index2}>{item}</span>)}
                                    </p>
                                </div>
                                {/*热度*/}
                                <div className="heat">
                                    <Heat width={20} height={60} step={item.heat}/>
                                    <i>{item.heat}</i>
                                </div>
                                {/*收藏*/}
                                <div className="collect">
                                    <i className={item.isCollect ? "yes" : "no"} onClick={this.addCollect.bind(this,item)} />
                                </div>
                            </div>
                        )}
                    </div>}

                {/*tab收藏-未登录*/}
                {showLoginEmpty &&
                    <div className="no-result">
                        <a onClick={()=>this.bus.emit("showLoginDialog")}>登录/注册</a>后可以添加收藏
                    </div>}

                {/*项目为空*/}
                {showEmpty &&
                    <div className="no-result">无相关内容</div>}

                {/*翻页*/}
                {total>pageSize &&
                    <div className="page">
                        <Pagination curPage={curPage} total={total} pageSize={pageSize} onChange={page=>this.toPage(page)}/>
                    </div>}

                {/*提示*/}
                {showAlert &&
                    <Alert content={alertContent} onClose={()=>this.setState({showAlert: false})}/>}

            </div>)
    }
}