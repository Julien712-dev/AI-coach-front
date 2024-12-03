import React, { useState } from 'react'
import firebase from 'firebase'


// There are some console.log() in this file which can be removed in the future.

export const fetchCuisineListAsync = async () => {
  return await fetchData({ path: '/cuisineList'})
  
}

export const updateCuisineList = ({ cuisineType, change }) => {
  updateNumericalData({ path: '/cuisineList', key: cuisineType, change })
}

export const fetchFavListAsync = async () => {
  return await fetchData({ path: '/profile/favList'})
}

export const updateFavList = (recipeId) => {
  updateData({ path: '/profile/favList', data: { [recipeId]: 1} })
}

// General functions

const fetchData = async ({ path }) =>{
  let data
  const { currentUser } = firebase.auth()
  await firebase.database().ref(`/users/${currentUser.uid}${path}`).once("value", (snapshot) => {
    data = snapshot.val()
  })
  return data 
}

const appendData = async ({ path, data }) => {
  const { currentUser } = firebase.auth()
  await firebase.database().ref(`/users/${currentUser.uid}${path}`).update(data).catch((err) => {
    console.log(err);
  })
}

const setData = async ({ path, data }) => {
  const { currentUser } = firebase.auth()
  await firebase.database().ref(`/users/${currentUser.uid}${path}`).set(data).catch((err) => {
    console.log(err);
  })
}

const updateNumericalData = async ({ path, key, change }) => {
  const value = await fetchData({ path: `${path}/${key}` })
  const newData = { [key]: value ? value + change : 10}
  appendData({ path, data: newData })
}


