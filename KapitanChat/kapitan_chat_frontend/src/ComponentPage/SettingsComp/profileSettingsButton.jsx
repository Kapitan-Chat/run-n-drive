import { useState } from "react";
import { useAuth } from "../../Provider/AuthProvider";

const ProfileSettingsButton = () => {
    const { profileSettingsShow, setProfileSettingsShow } = useAuth();

    return ( 
        <div className="settings-item m1 profile-settings-button">
            <button onClick={() => {setProfileSettingsShow(!profileSettingsShow)}}>Profile Settings</button>
        </div>
     );
}
 
export default ProfileSettingsButton;