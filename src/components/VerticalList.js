import React from "react";
import { FlatList, View } from "react-native";
import { Button, Title, Card, Paragraph } from "react-native-paper";
import { useNavigation } from '@react-navigation/native'

import useProfileFirebase from "../hooks/useProfileFirebase";


export default VerticalList = ({ data, screenName }) => {
  const navigation = useNavigation()
  
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <Card>
        <View style={{ flexDirection: "row", marginVertical: 10, paddingHorizontal: 5 }}>
          <Card.Cover
            style={{ height: 100, width: 140 }}
            source={{ uri: item.image }}
          />
          <View style={{ flex: 1 }}>
            <Card.Content>
              <Title>{item.title}</Title>
              <Paragraph>{item.nutrients.calories.amount} {item.nutrients.calories.unit} ({item.nutrients.protein.amount}P {item.nutrients.carbohydrates.amount}C {item.nutrients.fat.amount}F)</Paragraph>
            </Card.Content>
            <Card.Actions style={{ alignSelf: "flex-end" }}>
              <Button onPress={() => navigation.navigate(screenName, { recipe: item })}>ADD</Button>
            </Card.Actions>
          </View>
        </View>
      </Card>
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  )
}
