// Frontend

// pages/index.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [photos, setPhotos] = useState([]);
  const [topPhotos, setTopPhotos] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem('token');
      setToken(storedToken); // Set the token from localStorage
    }
    
    axios.get(`${API_URL}/photos`).then(res => setPhotos(res.data));
    axios.get(`${API_URL}/top-photos`).then(res => setTopPhotos(res.data));
  }, []);

  const refreshPhotos = async () => {
    const photosRes = await axios.get(`${API_URL}/photos`);
    const topPhotosRes = await axios.get(`${API_URL}/top-photos`);
    setPhotos(photosRes.data);
    setTopPhotos(topPhotosRes.data);
  };

  const signup = async () => {
    await axios.post(`${API_URL}/signup`, { username, password });
    alert('User created! Please log in.');
  };

  const login = async () => {
    const res = await axios.post(`${API_URL}/login`, { username, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const uploadPhoto = async () => {
    if (!image) {
      alert("Please select an image to upload.");
      return;
    }
  
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.userId;
  
    const formData = new FormData();
    formData.append('image', image);
    formData.append('userId', userId);
  
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('File uploaded:', response.data);
  
      // Update photos after upload
      setPhotos([...photos, response.data]);
      refreshPhotos(); // Refresh top photos as well
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const likePhoto = async (photoId) => {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const userId = decodedToken.userId;
  
    const res = await axios.post(`${API_URL}/like`, { photoId, userId });
  
    setPhotos(photos.map(photo => photo._id === photoId ? res.data : photo));
    refreshPhotos();
  };
  

  return (
    <div className="home-container">
      <h1 className="title">Photo Sharing App</h1>

      {!token ? (
        <div className="auth-container">
          <input
            className="input-field"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="auth-button" onClick={signup}>Sign Up</button>
          <button className="auth-button login" onClick={login}>
            Login
          </button>
        </div>
      ) : (
        <div className="upload-container">
          <input
            type="file"
            className="input-file"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button className="upload-button" onClick={uploadPhoto}>
            Upload Photo
          </button>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      )}

      {/* Top 5 Liked Photos */}
      <h2 className="section-title">Top 5 Liked Photos</h2>
      <div className="photo-grid">
        {topPhotos.map((photo) => (
          <div key={photo._id} className="photo-card">
            <img src={photo.url} alt="Top Photo" className="photo-image" />
            <p className="photo-user">
              Uploaded by: <b>{photo.user.username}</b>
            </p>
            <p className="photo-likes">❤️ {photo.likes} likes</p>
          </div>
        ))}
      </div>

      {/* All Photos */}
      <h2 className="section-title">All Photos</h2>
      <div className="photo-grid">
        {photos.map((photo) => (
          <div key={photo._id} className="photo-card">
            <img src={photo.url} alt="Uploaded" className="photo-image" />
            <p className="photo-user">
              Uploaded by: <b>{photo.user.username}</b>
            </p>
            <button
              className="like-button"
              onClick={() => likePhoto(photo._id)}
            >
              ❤️ {photo.likes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

