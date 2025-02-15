// frontend/src/components/Editor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { database, ref, get, set, update, remove } from '../firebase'; // Now using correct import
import MDEditor from '@uiw/react-md-editor';
import { Link } from 'react-router-dom';

const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16);

const Editor = () => {
    const { storyId } = useParams();
    const [text, setText] = useState('');
    const [draftText, setDraftText] = useState('');
    const socket = useRef(null);
    const [cursorPositions, setCursorPositions] = useState({});
    const [userColor, setUserColor] = useState(randomColor());
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [newSuggestionText, setNewSuggestionText] = useState('');
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        socket.current = io('http://localhost:5000');

        socket.current.on('connect', () => {
            console.log('Connected to WebSocket');
            socket.current.emit('joinStory', storyId);
        });

        //Get text from firebase and set it to editor
        const storyRef = ref(database,`stories/${storyId}`);
        get(storyRef).then((snapshot) => {
            if(snapshot.exists()){
                const story = snapshot.val();
                setText(story.content);
                setDraftText(story.content);
            } else {
              //If the stories don't exists on the platform
              setText('');
              setDraftText('');
            }
            setLoading(false); // Set loading to false after data loads
        })

        socket.current.on('textUpdate', (newText) => {
            console.log('Received textUpdate:', newText);
            setText(newText);
        });

        socket.current.on('cursorUpdate', (data) => {
            console.log('Received cursorUpdate:', data);
            setCursorPositions(prev => ({
                ...prev,
                [data.socketId]: { position: data.position, color: data.color }
            }));
        });

        socket.current.on('newComment', (comment) => {
            setComments(prev => [...prev, comment]);
        });

        socket.current.on('storyComments', (initialComments) => {
          setComments(initialComments);
        });

        socket.current.on('newSuggestion', (suggestion) => {
          setSuggestions(prev => [...prev, suggestion]);
        });

        socket.current.on('storySuggestions', (initialSuggestions) => {
          setSuggestions(initialSuggestions);
        })

        socket.current.emit('loadComments', storyId)

        socket.current.emit('loadSuggestions', storyId)

        return () => {
            socket.current.disconnect();
        };
    }, [storyId]);

    const handleDraftChange = (value) => {
        setDraftText(value);
    }

    const handlePublish = () => {
        console.log('Publishing text:', draftText);
        setText(draftText);

        const storyRef = ref(database, `stories/${storyId}`);
        update(storyRef, {
            content: draftText
        })

        socket.current.emit('textChange', { storyId, text: draftText });
    };

    const handleCursorChange = (position) => {
        console.log('Emitting cursorChange:', position);
        socket.current.emit('cursorChange', { storyId, position, color: userColor });
    };

    const handleEditorChange = (value, event) => {
        handleDraftChange(value);
        if (event?.selectionStart) {
            handleCursorChange(event.selectionStart);
        }
    };

    const handleAddComment = () => {
        if (newCommentText.trim()) {
            const comment = {
                storyId,
                text: newCommentText,
                userColor,
                timestamp: Date.now()
            };
            socket.current.emit('addComment', comment);
            setNewCommentText('');
        }
    };

    const handleAddSuggestion = () => {
      if(newSuggestionText.trim()){
        const suggestion = {
          storyId,
          text: newSuggestionText,
          userColor,
          timestamp: Date.now()
        };
        socket.current.emit('addSuggestion', suggestion);
        setNewSuggestionText('');
    }
  }

    if(loading){
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Editing Story: {storyId}</h2>
            <MDEditor
                value={draftText}  // Use draftText
                onChange={handleEditorChange}
            />

            <button onClick={handlePublish}>Publish</button>

            <div>
                {Object.entries(cursorPositions).map(([socketId, { position, color }]) => (
                    <span
                        key={socketId}
                        style={{
                            position: 'absolute',
                            left: `${position * 8}px`,
                            top: '0',
                            backgroundColor: color,
                            width: '2px',
                            height: '1em',
                            display: 'inline-block',
                            zIndex: 100,
                        }}
                    ></span>
                ))}
            </div>

            <div>
                <h3>Comments</h3>
                <ul>
                    {comments.map((comment, index) => (
                        <li key={index} style={{ color: comment.userColor }}>
                            {comment.text} - <small>{new Date(comment.timestamp).toLocaleTimeString()}</small>
                        </li>
                    ))}
                </ul>
                <div>
                    <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Add a comment"
                    />
                    <button onClick={handleAddComment}>Add Comment</button>
                </div>
            </div>

            <div>
              <h3>Suggestions</h3>
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li key={index} style={{color: suggestion.userColor}}>
                    {suggestion.text} - <small>{new Date(suggestion.timestamp).toLocaleTimeString()}</small>
                  </li>
                ))}
              </ul>
              <div>
                <input
                  type="text"
                  value={newSuggestionText}
                  onChange={(e) => setNewSuggestionText(e.target.value)}
                  placeholder="Add a suggestion"
                />
                <button onClick={handleAddSuggestion}>Add Suggestion</button>
              </div>
            </div>
        </div>
    );
};

export default Editor;