import { AuthProvider } from './contexts/AuthContext';
import { VideoUploadProvider } from './contexts/VideoUploadContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthLayout as A } from './layouts/AuthLayout';
import { RegLayout as R } from './layouts/RegLayout';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Register from './pages/Register';
import RegisterAuth from './pages/RegisterAuth';
import Login from './pages/Login';
import Logout from './pages/Logout';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordAuth from './pages/ResetPasswordAuth';
import EnterNewPassword from './pages/EnterNewPassword';
import NotFound from './pages/NotFound';
import Home from './pages/Home';

function App() {
    return (
        <VideoUploadProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path='/' element={<R><Home /></R>} />
                        <Route path='/app'>
                            <Route path='' element={<A><Dashboard /></A>} />
                            <Route path='editor' element={<A><Editor /></A>} />
                            <Route path='profile' element={<A><Profile /></A>} />
                            <Route path='settings' element={<A><Settings /></A>} />
                        </Route>
                        <Route path='/register'>
                            <Route path='' element={<R><Register /></R>} />
                            <Route path='auth/:emailAuthStr' element={<R><RegisterAuth /></R>} />
                        </Route>
                        <Route path='/login' element={<R><Login /></R>} />
                        <Route path='/forgot-password' element={<R><ResetPassword /></R>} />
                        <Route path='/password'>
                            <Route path='reset/auth/:resetPasswordAuthStr' element={<R><ResetPasswordAuth /></R>} />
                            <Route path='reset/enter-new-password' element={<R><EnterNewPassword /></R>} />
                        </Route>
                        <Route path='/logout' element={<R><Logout /></R>} />
                        <Route path='/*' element={<R><NotFound /></R>} />
                    </Routes>
                </Router>
            </AuthProvider >
        </VideoUploadProvider>
    );
}

export default App;
