import React, { useState } from "react";
import { Form, Button, Card, Container, Alert, Spinner } from "react-bootstrap";
import API from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("current_user", res.data.current_user);
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #6f42c1, #6610f2)",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <Card className="shadow-lg border-0 p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <Card.Body>
          <h2 className="text-center fw-bold mb-3" style={{ fontSize: "1.8rem" }}>
            🔐 Login
          </h2>
          <p className="text-center text-muted mb-4" style={{ fontSize: "1rem" }}>
            Please sign in to continue
          </p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handle}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label className="fw-semibold">Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label className="fw-semibold">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="lg"
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-semibold rounded-pill"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </Form>

          <div className="text-center mt-4">
            <a
              href="/register"
              className="text-decoration-none fw-semibold"
              style={{ color: "#6f42c1" }}
            >
              ➕ Create an account
            </a>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}