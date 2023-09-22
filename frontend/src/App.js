import { Container } from 'react-bootstrap';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import UpdateProfile from './components/UpdateProfile';
import Register from './components/Register';
import RegisterAuth from './components/RegisterAuth';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import ResetPasswordAuth from './components/ResetPasswordAuth';
import EnterNewPassword from './components/EnterNewPassword';
import NotFound from './components/NotFound';
import Home from './components/Home';

function App() {
    return (
        <AuthProvider>
            <Container className='d-flex align-itmes-center justify-content-center' style={{ minHeight: '100vh' }}>
                <div className='w-100' style={{ maxWidth: '400px' }}>
                    <Router>
                        <AuthProvider>
                            <Routes>
                                <Route path='/' element={<Home />} />
                                <Route path='/app'>
                                    <Route path='' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                                    <Route path='editor' element={<PrivateRoute><Editor /></PrivateRoute>} />
                                    <Route path='update-profile' element={<PrivateRoute><UpdateProfile /></PrivateRoute>} />
                                </Route>
                                <Route path='/register'>
                                    <Route path='' element={<Register />} />
                                    <Route path='auth/:emailAuthStr' element={<RegisterAuth />} />
                                </Route>
                                <Route path='/login' element={<Login />} />
                                <Route path='/forgot-password' element={<ResetPassword />} />
                                <Route path='/password'>
                                    <Route path='reset/auth/:resetPasswordAuthStr' element={<ResetPasswordAuth />} />
                                    <Route path='reset/enter-new-password' element={<EnterNewPassword />} />
                                </Route>
                                <Route path='/*' element={<NotFound />} />
                            </Routes>
                        </AuthProvider>
                    </Router>
                </div>
            </Container>
        </AuthProvider>
    );
}

export default App;
