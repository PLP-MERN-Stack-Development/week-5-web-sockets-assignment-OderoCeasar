import axios from 'axios';
import { toast } from 'react-toastify';


const API = (token) =>
  axios.create({
    baseURL: import.meta.env.VITE_APP_URL,
    headers: { Authorization: token },
  });
let url = import.meta.env.VITE_APP_URL;


export const loginUser = async (body) => {
  try {
    return await axios.post(`${url}/auth/login`, body);
  } catch (error) {
    console.log('error in loginuser api');
  }
};



export const googleAuth = async (token) => {
  try {
    // return await axios.post(`${url}/api/google`, body);
    return await axios.post("http://localhost:5000/api/google", { token });
  } catch (error) {
    console.log(error);
  }
};



// export const registerUser = async (body) => {
//   try {
//     return await axios.post(`${url}/auth/register`, body);
//   } catch (error) {
//     console.log('error in register api');
//   }
// };

export const registerUser = async (formData) => {
  try {
    const response = await axios.post("http://localhost:5000/auth/register", formData);
    return response; 
  } catch (error) {
    console.error("Register API failed:", error.response?.data || error.message);
    throw error; 
  }
};


export const validUser = async () => {
  try {
    const token = localStorage.getItem('userToken');

    const { data } = await API(token).get(`/auth/valid`, {
      headers: { Authorization: token },
    });
    return data;
  } catch (error) {
    console.log('error in valid user api');
  }
};


export const searchUsers = async (id) => {
  try {
    const token = localStorage.getItem('userToken');

    return await API(token).get(`/api/user?search=${id}`);
  } catch (error) {
    console.log('error in search users api');
  }
};


export const updateUser = async (id, body) => {
  try {
    const token = localStorage.getItem('userToken');

    const { data } = await API(token).patch(`/api/users/update/${id}`, body);
    return data;
  } catch (error) {
    console.log('error in update user api');
    toast.error('Something Went Wrong.try Again!');
  }
};


export const checkValid = async () => {
  const data = await validUser();
  if (!data?.user) {
    window.location.href = '/login';
  } else {
    window.location.href = '/chats';
  }
};

