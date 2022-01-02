import React, { useContext, useEffect, useState } from 'react';
import { UidContext } from '../AppContext';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { likePost, unlikePost } from '../../actions/post.actions';
import { useDispatch } from 'react-redux';

const LikeButton = ({ post }) => {
    const [liked, setLiked] = useState(false);
    const uid = useContext(UidContext);
    const dispatch = useDispatch();

    const like = () => {
        dispatch(likePost(post._id, uid))
        setLiked(true);
    };

    const unlike = () => {
        dispatch(unlikePost(post._id, uid))
        setLiked(false);
    };

    useEffect(() => {
        if (post.likers.includes(uid)) setLiked(true);
        else setLiked(false);
    }, [uid, post.likers, liked]);

    return (
        <div className='like-container'>
            {uid === null && (
                // Librairie pour avoir le coeur pour le like, ne pas pouvoir liker quand on est pas connecter
                <Popup
                    trigger={<img src='./img/icons/heart.svg' alt='like' />}
                    position={['bottom center', 'bottom right', 'bottom left']}
                    closeOnDocumentClick
                >
                    <div>Connectez-vous pour aimer un post !</div>
                </Popup>
            )}
            {uid && liked === false && (
                // coeur vide
                <img src='./img/icons/heart.svg' onClick={like} alt='like' />
            )}
            {uid && liked && (
                // coeur plein
                <img src='./img/icons/heart-filled.svg' onClick={unlike} alt='unlike' />
            )}
            <span>{post.likers.length}</span>
        </div>
    )
}

export default LikeButton;