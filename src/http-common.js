import axios from "axios";

export default axios.create({
    baseURL: 'http://krmn.herokuapp.com/api',
    headers: {
        "Content-type": "application/json"
    }
});