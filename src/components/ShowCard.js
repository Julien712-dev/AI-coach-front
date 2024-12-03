import React from "react";
import { StyleSheet } from "react-native";
import { Button, Title, Card, Paragraph } from "react-native-paper";

import useProfileFirebase from "../hooks/useProfileFirebase";

export default ShowCard = ({
  title,
  cuisineType,
  description,
  image,
  enableLike,
}) => {
  const { updateCuisineList } = useProfileFirebase();
  return (
    <Card>
      <Card.Cover style={{ height: 140 }} source={{ uri: image }} />
      <Card.Content style={{ marginBottom: 50 }}>
        <Title>{title}</Title>
        <Paragraph>{description}</Paragraph>
      </Card.Content>
      {enableLike ? (
        <Card.Actions style={styles.iconContainer}>
          <Button
            icon="close"
            onPress={() => {
              updateCuisineList({ cuisineType, change: -1 });
            }}
          ></Button>
          <Button
            icon="heart-outline"
            onPress={() => {
              updateCuisineList({ cuisineType, change: 1 });
            }}
          ></Button>
        </Card.Actions>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    height: 30,
    marginTop: 10,
    marginBottom: 5,
    position: "absolute",
    flexDirection: "row",
    right: 0,
    bottom: 0,
  },
});
