import axios from 'axios';

export default axios.create({
    // baseURL: 'http://stellar-envoy-302506.df.r.appspot.com', 
    baseURL: 'http://192.168.200.82:8080/', // DEBUG
});