import React, { Component } from "react";
import {
  Route,
  Redirect,
  Switch
} from "react-router-dom";
import ViewBase from "../../components/ViewBase";
import ArticleDetail from "./children/ArticleDetail";
import "./stylus/article.styl";
import Edit from "./children/Edit";

export default class ArticleManage extends ViewBase {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    let {match, history} = this.props;

    const detail = ({match, location}) =>
      <ArticleDetail location={location}  history={history} />;

    const edit = ({match, location}) =>
      <Edit location={location}  history={history} />;

    return (
      <div className="article-route">
        <Switch>
          <Route path={`${match.url}/detail`} component={detail}/>
          <Route path={`${match.url}/edit`} component={edit}/>
          <Redirect to={`home`}/>
        </Switch>
      </div>
    );
  }
}
