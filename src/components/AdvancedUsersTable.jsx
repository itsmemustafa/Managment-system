import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUsers } from "../db/dbService";

const AdvancedUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const userData = await getAllUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    // Filter by role
    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) =>
        filterStatus === "active" ? user.isActive : !user.isActive
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, sortField, sortDirection, filterRole, filterStatus]);

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Advanced Users Table</h2>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Filter by Role:
          </label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="all">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERVISOR">Supervisor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Filter by Status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("id")}
              >
                ID {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("role")}
              >
                Role{" "}
                {sortField === "role" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("isActive")}
              >
                Status{" "}
                {sortField === "isActive" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Password</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No users found matching the filters
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-red-100 text-red-800"
                          : user.role === "SUPERVISOR"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {user.password ? "••••••••" : "No password"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredAndSortedUsers.length} of {users.length} users
      </div>
    </div>
  );
};

export default AdvancedUsersTable;
