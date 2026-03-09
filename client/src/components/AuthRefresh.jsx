import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '@/services/api';
import { updateUser } from '@/redux/slices/authSlice';

/** When token exists, refetch user from API so role/profile stay in sync (e.g. after DB role change). */
export default function AuthRefresh() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);

  useEffect(() => {
    if (!token) return;
    authApi
      .getMe()
      .then((res) => {
        if (res.data?.user) dispatch(updateUser(res.data.user));
      })
      .catch(() => {});
  }, [token, dispatch]);

  return null;
}
