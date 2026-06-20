import { useState } from "react";
import Search from "../ComponentPage/Search";
import { useAuth } from "../Provider/AuthProvider";

const Create = ({groupType, setActive}) => {

    const {addGroupUsers, setAddGroupUsers, ChatApi, me, GetChatList } = useAuth();

    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');

    function handleSubmit(e){
        e.preventDefault();
        async function createNewChat(type){
            const usersIds = addGroupUsers.map((user) => user.id)
            const data = {
                "name": groupName,
                "description": groupDescription,
                "type": type,
                "created_by": me.id,
                "users": [me.id, ...usersIds]
            };
            const response = await ChatApi().post(data);
            const updatedChats = await GetChatList(); 
            setChatId(response.id);
        }
        if(groupType == 'GROUP'){
            createNewChat('GROUP');
        }else if(groupType == 'CHANNEL'){
            createNewChat('CHANNEL');
        }else{
            console.log('Error! Invalid group type')
        }
    }

    return ( 
        <div className="create-group-channel-container">
            <form
                className="create-group-channel-form"
                onSubmit={handleSubmit}
            >
                <div className="group-channel-information">
                    <input 
                        type="text" 
                        className="create-group-channel-name" 
                        placeholder={`Enter your chat name`}
                        onChange={(e) => {setGroupName(e.target.value)}}
                    />
                    <input 
                        type="text" 
                        className="create-group-channel-description" 
                        placeholder={`Enter your chat description`}
                        onChange={(e) => {setGroupDescription(e.target.value)}}
                    />
                    <button type="submit">Create group</button>
                </div>
                
                <div className="group-channel-users">
                    <Search isUserSearch={true} forGroupchat={true}/>
                    <div className="added-users">
                        {
                            (addGroupUsers.length > 0) ? (
                                addGroupUsers.map((user, i) => {
                                    return <div key={i} className="added-user">{user.username}</div>
                                })
                            ) : (
                                <h2>No users added</h2>
                            )
                        }
                    </div>
                </div>
                <h2 className="create-group-channel-cancel" onClick={() => setActive(false)}>Cancel</h2>
            </form>
        </div>
     );
}
 
export default Create;