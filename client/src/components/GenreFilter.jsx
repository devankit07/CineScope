import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '@/redux/slices/movieSlice';
import { GENRE_OPTIONS, SORT_OPTIONS } from '@/utils/constants';
import { cn } from '@/utils/cn';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export default function GenreFilter() {
  const dispatch = useDispatch();
  const { genre, rating, year, sortBy } = useSelector((s) => s.movies.filters);

  const update = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 glass border-b border-white/5">
      <select
        value={genre}
        onChange={(e) => update('genre', e.target.value)}
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-accent-red/50 outline-none"
      >
        {GENRE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <select
        value={rating}
        onChange={(e) => update('rating', e.target.value)}
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-accent-red/50 outline-none"
      >
        <option value="">All ratings</option>
        {[6, 7, 8, 9].map((n) => (
          <option key={n} value={n}>{n}+</option>
        ))}
      </select>
      <select
        value={year}
        onChange={(e) => update('year', e.target.value)}
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-accent-red/50 outline-none"
      >
        <option value="">All years</option>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <select
        value={sortBy}
        onChange={(e) => update('sortBy', e.target.value)}
        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-accent-red/50 outline-none"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
