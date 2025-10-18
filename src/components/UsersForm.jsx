import React, { useState } from "react";
import { addUser } from "../db/dbService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const UsersForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("User Data:", formData);
      addUser(formData);
      alert("User added successfully!");

      // Reset form
      setFormData({
        email: "",
        password: "",
        role: "",
        isActive: true,
      });
      setErrors({});
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">Enter User Detail</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email *
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password *
          </label>
          <Input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium">
            Role *
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-xs text-destructive">{errors.role}</p>
          )}
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            id="isActive"
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 accent-primary"
          />
          <label htmlFor="isActive" className="cursor-pointer text-sm">
            Active
          </label>
        </div>

        <Button type="submit" className="mt-2">
          Submit User Data
        </Button>
      </form>
    </div>
  );
};

export default UsersForm;
