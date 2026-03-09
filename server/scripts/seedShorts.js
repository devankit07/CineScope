import 'dotenv/config';
import mongoose from 'mongoose';
import ShortClip from '../models/ShortClip.js';

const seedClips = [
  { movieId: 'tt0111161', title: 'The Shawshank Redemption', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNkLWJiNDEtZDVmZjk2YjUyZGEyXkEyXkFqcGdeQXVyNjk1Njg5NTA@._V1_SX300.jpg', genre: 'Drama' },
  { movieId: 'tt0068646', title: 'The Godfather', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', genre: 'Crime, Drama' },
  { movieId: 'tt0137523', title: 'Fight Club', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3YjQ0Mzk0ZDlmXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg', genre: 'Drama' },
  { movieId: 'tt1375666', title: 'Inception', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg', genre: 'Action, Sci-Fi, Thriller' },
  { movieId: 'tt0133093', title: 'The Matrix', videoUrl: '', poster: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg', genre: 'Action, Sci-Fi' },
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
