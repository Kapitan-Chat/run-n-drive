import { useEffect, useState } from "react";
import { useAuth } from "../Provider/AuthProvider";

const About = ({show, chatId, chatContent}) => {
    const [isAbout, setIsAbout] = show;
    const [info, setInfo] = useState(null);

    const { ChatApi, me, UserApi } = useAuth();

    useEffect(() => {
        async function getChat(){
            const response = await ChatApi().get(chatId);
            if (response.type === 'DIRECT'){
                const user = await UserApi().get(response.users.filter((user) => user != me.id)[0]);
                setInfo({
                    img: chatContent.img,
                    name: response.name,
                    description: user.profile.bio
                });
            }else{
                setInfo({
                    img: chatContent.img,
                    name: response.name,
                    description: response.description
                })
            }
        }
        getChat();
        
    }), [chatId];

    return ( 
        <div 
            className="about-container"
            style={{
                display: (isAbout) ? "flex" : "none"
            }}
        >
            <div className="about-content">
                <img src={(info) ? info.img : null} alt="" />
                <h2>{(info) ? info.name : null}</h2>
                <p>{(info) ? info.description : null}</p>
                <button 
                    className="about-exit"
                    onClick={() => setIsAbout(false)}
                >🗙</button>
            </div>
        </div>
    );
}
 
export default About;
