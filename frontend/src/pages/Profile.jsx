import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import API from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    API.get("/auth/me")
      .then((r) => {
        setUser(r.data);
        setName(r.data.name);
      })
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    setLoadingProfile(true);
    setMessage(null);
    try {
      await API.put("/auth/profile", { name }); // ✅ send JSON instead of query params
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (e) {
      setMessage({ type: "danger", text: "Failed to update profile" });
    } finally {
      setLoadingProfile(false);
    }
  };

  const changePassword = async () => {
    setLoadingPassword(true);
    setMessage(null);
    try {
      await API.post("/auth/change-password", {
        old_password: oldPass,
        new_password: newPass,
      }); // ✅ send JSON
      setMessage({ type: "success", text: "Password changed successfully!" });
      setOldPass("");
      setNewPass("");
    } catch (e) {
      setMessage({ type: "danger", text: "Failed to change password" });
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!user) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading profile...</p>
      </Container>
    );
  }

  return (
    <Container style={{ maxWidth: "600px", marginTop: "40px", fontFamily: "Poppins, sans-serif" }}>
      <h2 className="mb-4 text-center">👤 Profile</h2>

      {message && <Alert variant={message.type}>{message.text}</Alert>}

      {/* Profile Info */}
      <Card className="p-4 shadow-sm mb-4">
        <h5 className="mb-3">Update Profile</h5>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="primary"
            onClick={saveProfile}
            disabled={loadingProfile}
            className="w-100 rounded-pill"
          >
            {loadingProfile ? <Spinner size="sm" animation="border" /> : "Save Changes"}
          </Button>
        </Form>
      </Card>

      {/* Change Password */}
      <Card className="p-4 shadow-sm">
        <h5 className="mb-3">Change Password</h5>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Old Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter old password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </Form.Group>
          <Button
            variant="warning"
            onClick={changePassword}
            disabled={loadingPassword}
            className="w-100 rounded-pill"
          >
            {loadingPassword ? <Spinner size="sm" animation="border" /> : "Change Password"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}