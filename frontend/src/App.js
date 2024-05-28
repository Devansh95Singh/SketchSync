import React, { useRef, useEffect, useState } from 'react';
import io from 'socket.io-client';

const App = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socket = io('http://localhost:5000');
        setSocket(socket);

        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('draw', ({ offsetX, offsetY, color, lineWidth }) => {
            const context = contextRef.current;
            context.beginPath();
            context.moveTo(offsetX, offsetY);
            context.lineTo(offsetX, offsetY);
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
            context.stroke();
            context.closePath();
        });

        socket.on('image', (imageData) => {
            const img = new Image();
            img.src = imageData;
            img.onload = () => {
                contextRef.current.drawImage(img, 0, 0);
            };
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        const context = canvas.getContext('2d');
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = 'black';
        context.lineWidth = 5;
        contextRef.current = context;
    }, []);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        socket.emit('draw', { offsetX, offsetY, color: contextRef.current.strokeStyle, lineWidth: contextRef.current.lineWidth });
    };

    const saveDrawing = () => {
        const canvas = canvasRef.current;
        const imageData = canvas.toDataURL('image/png');
        socket.emit('image', imageData);
    };

    return (
        <div>
            <canvas
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={draw}
                ref={canvasRef}
            />
           <div>
             <button onClick={saveDrawing}>Save Drawing</button>
           </div>
        </div>
    );
};

export default App;
