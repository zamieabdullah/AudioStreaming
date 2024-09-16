import { Route, Routes } from 'react-router-dom';

export const Router = () => {
    return (
        <Routes>
            <Route path="" element={<p>Testing</p>}/>
            <Route path="speaking" element={<>Speaking</>}/>
            <Route path="listening" element={<>Listening</>}/>
        </Routes>
    )
}