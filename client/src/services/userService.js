import api from "../api/axois";

// Update Profile
export const updateProfile = async (formData) => {
    try {
        const { data } = await api.patch(
            "/user/update-profile",
            formData);

        return data;
    } catch (error) {
        console.error("Update Profile Error:", error);
        throw error;
    }
};

// Change Password
export const changePassword = async (payload) => {
    try {
        const { data } = await api.post(
            "/user/change-password",
            payload
        );

        return data;
    } catch (error) {
        console.error("Change Password Error:", error);
        throw error;
    }
};