import React from 'react';
import PropTypes from 'prop-types';
import MapContainer from "./../MapContainer.jsx";
import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle, Button, Col, Row, CardColumns } from 'reactstrap';
import MapContainer from '../MapContainer.jsx';

const PostView = (props) => {
    const { post } = props;
    return (
        <Card>
            <CardImg src={post.img1} />
            <CardBody>
                <CardTitle>{post.title}</CardTitle>
                <CardSubtitle>{post.tags}</CardSubtitle>
                <CardText>{post.text}</CardText>
            </CardBody>
            <MapContainer />
        </Card>
    );
}

export default PostView;