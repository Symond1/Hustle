import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [token, setToken] = useState("");

    useEffect(() => {
        const tokenFromUrl = searchParams.get("token");
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            toast.error("Token is missing from the URL.");
        }
    }, [searchParams]);

    const handleResetPassword = async () => {
        if (!newPassword) {
            toast.error("Please enter your new password.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password should be at least 8 characters long.");
            return;
        }

        if (!token) {
            toast.error("Invalid or missing token.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.post("http://localhost:8000/api/v1/user/reset-password", {
                token,
                password: newPassword,
            });

            if (res.data.success) {
                toast.success("Password has been reset successfully!");
            } else {
                toast.error(res.data.message || "Failed to reset the password.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Reset Password</h2>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSubmitting}
                    style={styles.input}
                />
                <button
                    onClick={handleResetPassword}
                    disabled={isSubmitting}
                    style={{
                        ...styles.button,
                        backgroundColor: isSubmitting ? "#ccc" : "#000",
                    }}
                >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f4f6f9",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        padding: "20px",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center",
    },
    title: {
        fontSize: "24px",
        marginBottom: "20px",
        color: "#333",
    },
    input: {
        width: "100%",
        padding: "10px",
        marginBottom: "20px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        fontSize: "16px",
    },
    button: {
        width: "100%",
        padding: "12px",
        color: "#fff",
        fontSize: "16px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
};

export default ResetPassword;
