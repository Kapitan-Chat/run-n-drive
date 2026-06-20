import { useEffect,useState } from "react";
import ChatList from "./ChatList";
import { useAuth } from "../Provider/AuthProvider";

import search_icon from "../assets/search_icon.png";

/**
 * Компонент для поиска чатов
 * @param {object} props - Параметры компонента
 * @param {array} props.chatList - Список чатов
 * @returns {jsx} - Компонент для поиска чатов
 */
export default function Search({isUserSearch=false, forGroupchat=false, chatlist=[]}) {

    const {
        UserApi,
        chatList,
        setChatId,
        setUserSearchActive,
        userSearchActive,
        setMessageSearchActive,
        messageSearchActive,
        groupchatUserSearchActive,
        setGroupchatUserSearchActive,
        me
    } = useAuth();

    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [localSearchResult, setLocalSearchResult] = useState([]);
    

    function searching(){
        if (search.length <2) return []

        let result =  chatlist.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
        
        return result;
    }

    function userSearching(){
        if (search.length <2) return []

        return UserApi().search(search);
    }

    function localChatSearching(){
        if (search.length < 2) return []

        return chatList.filter((chat) => chat.name.includes(search));
    }

    useEffect(() => {
        async function runSearch() {
            if (search.length < 2) {
                setSearchResult([]);
                return;
            }

            if (isUserSearch) {
                const localUsers = chatList.map((user) => user.name);
                const res = await UserApi().search(search);
                setSearchResult(res.filter(
                    (user) => (
                        ((!forGroupchat) ? !localUsers.includes(user.username) : true) &&
                        me.username != user.username
                    ) 
                ));
                setLocalSearchResult(localChatSearching());
                console.log('Looking for user...');
                console.log('Global search result:', searchResult, 'Current username:', me.username);
                console.log('Local search result:', localSearchResult);
            } else {
                console.log('Looking for message...');
                setSearchResult(searching());
            }
        }

        runSearch();

    }, [search]);

    console.log(searchResult);
    return (
        <div className="search-container">
        <img type="button" className="search-icon" src={search_icon} />
        <input  
            type="text" 
            className="sidebar-top-search" 
            placeholder="Search" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            onFocus={(e) => {
                if(isUserSearch){
                    if(forGroupchat){
                        setGroupchatUserSearchActive(true)
                    }else{
                        setUserSearchActive(true)
                    }
                }else{
                    setMessageSearchActive(true)
                }
            }}
        />
        {
            ((isUserSearch) ? (forGroupchat) ? groupchatUserSearchActive : userSearchActive : messageSearchActive) && <button 
                className="sidebar-top-search-cancel"
                onClick={() => {
                    if(isUserSearch){
                        if(forGroupchat){
                            setGroupchatUserSearchActive(false)
                        }else{
                            setUserSearchActive(false)
                        }
                    }else{
                        setMessageSearchActive(false)
                    }
                }}
            >🗙</button>
        }
        
        {
            (
                ( searchResult.length > 0 || localSearchResult ) && 
                ((isUserSearch) ? (forGroupchat) ? groupchatUserSearchActive : userSearchActive : messageSearchActive)) &&
                (
                    <div 
                        className={(!forGroupchat) ? "search-result-wrapper" : "search-result-wrapper groupchat"}
                        style={{
                            top: (isUserSearch) ? "135px" : "115px"
                        }}
                    >
                        <div className="search-result">
                            {
                                (isUserSearch && !forGroupchat) && <h2>Global Search</h2>
                            }
                            <ChatList chatList={searchResult} setChatId={setChatId} isNewChat={isUserSearch ? true : false} isUser={isUserSearch ? true : false} forGroupchat={forGroupchat}/>
                        </div>
                        {
                            (isUserSearch && !forGroupchat) && (
                                <div className="search-result" style={{marginTop: (!forGroupchat) ? "25vh" : "125px"}}>
                                    <h2>Local chats</h2>
                                    <ChatList chatList={localSearchResult} setChatId={setChatId} />
                                </div>
                            )
                        }
                    </div>
                )
            
        }
        
        </div>
    );
}