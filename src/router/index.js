import { Route, Routes } from 'react-router-dom';
import AudioStreamer from '../views/AudioStreamer';

export const Router = () => {
    return (
        <Routes>
            <Route path="" element={<AudioStreamer/>}/>
            <Route path="speaking" element={<>Speaking</>}/>
            <Route path="listening" element={<>Listening</>}/>
        </Routes>
    )
}