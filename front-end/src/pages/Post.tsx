import React from "react";
import Frame from "../components/Frame";
import Container from "react-bootstrap/Container";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

import { Link } from "react-router-dom";

const Main: React.FC = props => {
  return (
    <Frame>
      <Container style={{ marginTop: "32px" }}>
        <Row>
          <Col>
            <span>wda43779</span> · <span>2小时前</span>
            <h2>动态规划快速入门</h2>
            <button style={{ background: "unset" }}> 赞 5 </button>
            <button style={{ background: "unset" }}> 评论 5 </button>
            <hr />
            <Form>
              <Form.Group controlId="formBasicChecbox">
                <Form.Label>
                  <h3>你的评论</h3>
                </Form.Label>
                <Form.Control as="textarea" rows="3" />
              </Form.Group>
              <Button variant="primary" type="submit">
                提交
              </Button>
            </Form>
            <hr />
            <h3>评论</h3>
            <div>
              <span>wda43779</span> · <span>2小时前</span>
              <div style={{ margin: "16px 0" }}>
                Is this currently "only" a legal problem, or are the GMO crop
                companies able to produce seeds that produce sterile crops? I'm
                sure this has already been done to death, but... Cheesy sci-fi
                plot where genetically engineered crops crowd out all the
                reproducing ones, and then humanity starves to death when evil
                corp loses their ability to produce the seeds? Could we maybe
                not go down this route, please?
              </div>
              <button style={{ background: "unset" }}>回复</button>
            </div>
            <div>
              <span>wda43779</span> · <span>2小时前</span>
              <div style={{ margin: "16px 0" }}>
                It's not about GMO, but about conventional breeding.There is a
                concept called hybrid breeding, both for animals and plants. The
                "final" product, the seed for the farmer, the piglet raised for
                mass production, is bred from two parent lines, one for the male
                part, one for the female. Both are relatively inbred so they are
                mostly homocygotic. Their offspring, because of Mendelian
                genetics, is mostly heterocygotic, but very homegeneous, which
                is a great thing, industrially speaking.However, a farmer can't
                just raise those piglets and breed them on his own. Not because
                of patents or licenses, but just because the offspring would be
                all over the map, genetically. And probably less profitable. The
                breeding companies need a complicated system to develop these
                lines and provide their customers with the best seed/livestock.
                That takes a lot of money and effort.
              </div>
              <button style={{ background: "unset" }}>回复</button>
            </div>
          </Col>
        </Row>
      </Container>
    </Frame>
  );
};

export default Main;
