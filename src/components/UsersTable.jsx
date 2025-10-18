import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUsers, addUser, updateUser, deleteUser } from "../db/dbService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Save, X, PlusCircle } from "lucide-react";
import ExportCSV from '@/components/ExportCSV';
import getUser from "../Utils/getUser";

const AdvancedUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [adding, setAdding] = useState(false);

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

  const refreshUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

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

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(query) ||
        user.id.toString().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    }

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
  }, [users, sortField, sortDirection, filterRole, filterStatus, searchQuery]);

  const startAdd = () => {
    setAdding(true);
    setDraft({ email: "", password: "", role: "USER", isActive: true });
    setEditingId(null);
  };

  const cancelAdd = () => {
    setAdding(false);
    setDraft(null);
  };

  const saveAdd = async () => {
    try {
      const payload = {
        email: (draft.email || "").trim(),
        password: draft.password || "",
        role: String(draft.role || "USER").toUpperCase(),
        isActive: !!draft.isActive,
      };
      if (!payload.email) return alert("Email is required");
      await addUser(payload);
      await refreshUsers();
      setAdding(false);
      setDraft(null);
    } catch (e) {
      alert(e.message || "Failed to add user");
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setDraft({ ...user });
    setAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async () => {
    try {
      const changes = { ...draft };
      if (changes.role) changes.role = String(changes.role).toUpperCase();
      if (!changes.email) return alert("Email is required");
      await updateUser(editingId, {
        email: changes.email,
        password: changes.password,
        role: changes.role,
        isActive: !!changes.isActive,
      });
      await refreshUsers();
      setEditingId(null);
      setDraft(null);
    } catch (e) {
      alert(e.message || "Failed to update user");
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      await refreshUsers();
    } catch (e) {
      alert(e.message || "Failed to delete user");
    }
  };

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div className="p-6">
    
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {(() => {
            const cu = getUser('currentUser');
            const role = String(cu?.role || '').toUpperCase();
            if (role === 'ADMIN' || role === 'SUPERVISOR') {
              const cols = [
                { key: 'id', label: 'ID' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role' },
                { key: 'isActive', label: 'Active' },
              ];
              const data = filteredAndSortedUsers.map(u => ({
                id: u.id,
                email: u.email,
                role: u.role,
                isActive: u.isActive ? 'Active' : 'Inactive',
              }));
              return <ExportCSV data={data} columns={cols} fileName="users.csv" />;
            }
            return null;
          })()}
          <Button onClick={startAdd} variant="default" className="gap-2">
          <PlusCircle size={16} /> Add User
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by email, ID, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

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
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adding && (
              <TableRow>
                <TableCell className="text-muted-foreground">New</TableCell>
                <TableCell>
                  <Input
                    placeholder="email@domain.com"
                    value={draft?.email || ""}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <select
                    className="px-2 py-2 border rounded-md bg-background"
                    value={draft?.role || "USER"}
                    onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="USER">User</option>
                  </select>
                </TableCell>
                <TableCell>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!draft?.isActive}
                      onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                    />
                    Active
                  </label>
                </TableCell>
                <TableCell>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={draft?.password || ""}
                    onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveAdd} className="gap-1">
                      <Save size={14} /> Save
                    </Button>
                    <Button size="sm" variant="secondary" onClick={cancelAdd} className="gap-1">
                      <X size={14} /> Cancel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
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
                  <TableCell>
                    {editingId === user.id ? (
                      <Input
                        value={draft?.email || ""}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                      />
                    ) : (
                      user.email
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <select
                        className="px-2 py-2 border rounded-md bg-background"
                        value={draft?.role || "USER"}
                        onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="SUPERVISOR">Supervisor</option>
                        <option value="USER">User</option>
                      </select>
                    ) : (
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
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!draft?.isActive}
                          onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                        />
                        Active
                      </label>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {editingId === user.id ? (
                      <Input
                        type="password"
                        placeholder="Password"
                        value={draft?.password || ""}
                        onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                      />
                    ) : (
                      user.password ? "••••••••" : "No password"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === user.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="gap-1">
                          <Save size={14} /> Save
                        </Button>
                        <Button size="sm" variant="secondary" onClick={cancelEdit} className="gap-1">
                          <X size={14} /> Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(user)} className="gap-1">
                          <Pencil size={14} /> Edit
                        </Button>
                        <Button size="sm" variant="outline" style={{ color: "red" }} onClick={() => removeUser(user.id)} className="gap-1">
                          <Trash2 size={14} /> Delete
                        </Button>
                      </div>
                    )}
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