import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";

const Frame: React.FC<{
  wrapperStyle?: React.CSSProperties;
}> = props => {
  return (
    <>
      <Navbar expand="lg" style={{ boxShadow: "0 1px 32px rgba(26,26,26,.2)" }}>
        <Link to="/" className="navbar-brand">
          <h1 style={{ fontSize: "1.8rem" }}>生活圈</h1>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavLink href="/">分享</NavLink>
            <NavLink href="/jobs">评论</NavLink>
            <NavLink href="#link">问答</NavLink>
            <NavLink href="#link">话题</NavLink>
            <NavLink href="#link">活动</NavLink>
            <NavLink href="/community">社区</NavLink>
            <NavLink href="#link">通知</NavLink>
          </Nav>
          <Form inline>
            <FormControl type="text" className="mr-sm-2" />
            <Button variant="outline-success">搜索</Button>
            <div
              style={{
                borderLeft: "1px solid #999",
                height: "1.5em",
                width: "0",
                margin: "0 32px"
              }}
            />
            <Nav>
              <NavLink href="/login">登录</NavLink>
              <NavLink href="/signUp">注册</NavLink>
            </Nav>
          </Form>
        </Navbar.Collapse>
      </Navbar>
      <div style={props.wrapperStyle}>{props.children}</div>
    </>
  );
};

const NavLink: React.FC<{ href: string }> = props => {
  return (
    <Link to={props.href} className="nav-link">
      {props.children}
    </Link>
  );
};

export default Frame;
