import 'dotenv/config';
import mongoose from 'mongoose';
import ShortClip from '../models/ShortClip.js';

const seedClips = [
  { movieId: 'tt0111161', title: 'The Shawshank Redemption', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNkLWJiNDEtZDVmZjk2YjUyZGEyXkEyXkFqcGdeQXVyNjk1Njg5NTA@._V1_SX300.jpg', genre: 'Drama' },
  { movieId: 'tt0068646', title: 'The Godfather', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', genre: 'Crime, Drama' },
  { movieId: 'tt0137523', title: 'Fight Club', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3YjQ0Mzk0ZDlmXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg', genre: 'Drama' },
  { movieId: 'tt1375666', title: 'Inception', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg', genre: 'Action, Sci-Fi, Thriller' },
  { movieId: 'tt0133093', title: 'The Matrix', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg', genre: 'Action, Sci-Fi' },
  { movieId: 'tt0167260', title: 'The Lord of the Rings: The Return of the King', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', genre: 'Adventure, Drama, Fantasy' },
  { movieId: 'tt0120737', title: 'The Lord of the Rings: The Fellowship of the Ring', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg', genre: 'Adventure, Drama, Fantasy' },
  { movieId: 'tt0109830', title: 'Forrest Gump', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg', genre: 'Drama, Romance' },
  { movieId: 'tt0076759', title: 'Star Wars: Episode IV - A New Hope', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BOTA5NjhiOTAtZWM0ZC00MWNhLThiMzEtZDFkOTk2OTU1ZDJkXkEyXkFqcGdeQXVyMTA4NDI1NTQx._V1_SX300.jpg', genre: 'Action, Adventure, Sci-Fi' },
  { movieId: 'tt0245429', title: 'Spirited Away', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5YjItMjgyYjJiY2Q0OWIwXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg', genre: 'Animation, Adventure, Family' },
  { movieId: 'tt0816692', title: 'Interstellar', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg', genre: 'Adventure, Drama, Sci-Fi' },
  { movieId: 'tt0114369', title: 'Se7en', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BOTUwODM5MTctZjJlMi00ZTAzLWI4Y2YtOTQ4NGIxM2FkN2M2XkEyXkFqcGdeQXVyNDY2MTk1ODk@._V1_SX300.jpg', genre: 'Crime, Drama, Mystery' },
  { movieId: 'tt0060196', title: 'The Good, the Bad and the Ugly', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BOTQ5NDI3MTI2MF5BMl5BanBnXkFtZTgwNDQ4ODE5MDE@._V1_SX300.jpg', genre: 'Western' },
  { movieId: 'tt0139684', title: 'The Green Mile', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BMTUxMzQyNjA5MF5BMl5BanBnXkFtZTYwOTU2NTY3._V1_SX300.jpg', genre: 'Crime, Drama, Fantasy' },
  { movieId: 'tt0088763', title: 'Back to the Future', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg', genre: 'Adventure, Comedy, Sci-Fi' },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cinescope');
  const count = await ShortClip.countDocuments();
  if (count > 0) {
    console.log('ShortClips already exist, skipping seed.');
    process.exit(0);
    return;
  }
  await ShortClip.insertMany(seedClips);
  console.log('Seeded', seedClips.length, 'ShortClips.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
