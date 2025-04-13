import React, { useContext } from 'react';
import { UserContext } from '../context/userContext';
import '../css/movie.css';

export default function MoviePage() {
  const { responseData } = useContext(UserContext);

  // Nếu backend trả về lỗi, hiển thị thông báo lỗi
  if (responseData?.error) {
    return (
      <div className="movie-card">
        <h1 className="movie-title">Error</h1>
        <p className="description">Error: {responseData.error}</p>
        <button className="next-button" onClick={() => window.location.href = '/'}>Try Again</button>
      </div>
    );
  }

  const movieList = responseData?.reply;
  console.log('Movie List:', movieList);

  return (
    <div className="movie-card">
      <h1 className="movie-title">Movie Recommendations</h1>
      
      {/* Nếu movieList chưa có dữ liệu */}
      {!movieList && (
        <p className="description">
          Please wait while we find your movie...
        </p>
      )}
      
      {/* Nếu movieList là một mảng, hiển thị danh sách phim */}
      {Array.isArray(movieList) ? (
        movieList.map((movie, index) => (
          <div key={index} className="movie-item">
            <h2 className="movie-name">{movie.title || 'Untitled'}</h2>
            {movie.thumbnail && (
              <img src={movie.thumbnail} alt={movie.title} className="movie-thumbnail" />
            )}
            <p className="description">
              {movie.description || 'No description available.'}
            </p>
            {movie.note && <p className="note">💡 {movie.note}</p>}
          </div>
        ))
      ) : (
        // Nếu movieList là kiểu string, hiển thị trực tiếp (có thể hiển thị lỗi hay thông báo)
        typeof movieList === 'string' ? (
          <p className="description">{movieList}</p>
        ) : (
          <p className="description">No movie recommendations found. Please try again.</p>
        )
      )}

      <button className="next-button" onClick={() => window.location.href = '/'}>Next Movie</button>
    </div>
  );
}
