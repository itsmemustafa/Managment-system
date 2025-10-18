import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { addMaintenance } from "../db/dbService.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const maintainanceform = () => {
  const defaultValues = {
    date: new Date().toISOString().substring(0, 10),
    time: new Date().toTimeString().substring(0, 5),
    orderNumber: "",
    governorate: "",
    customerName: "",
    address: "",
    phoneNumber: "",
    additionalPhoneNumber: "",
    deviceType: "",
    deviceTypeCode: "",
    brand: "",
    sup: "",
    defectDescription: "",
    isRelatedToProject: false,
    projectName: "",
    notes: "",
    raisedBy: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isRelatedToProject = watch("isRelatedToProject");

  const onSubmit = async (data) => {
    const dateIso = `${data.date}T${data.time}:00.000Z`;

    const finalData = {
      date: dateIso,
      time: data.time,
      orderNumber: data.orderNumber || null,
      governorate: data.governorate || null,
      customerName: data.customerName || "",
      address: data.address || "",
      phoneNumber: data.phoneNumber || "",
      additionalPhoneNumber: data.additionalPhoneNumber || "",
      deviceType: data.deviceType || "",
      deviceTypeCode: data.deviceTypeCode || "",
      brand: data.brand || "",
      sup: data.sup || "",
      defectDescription: data.defectDescription || "",
      isRelatedToProject: !!data.isRelatedToProject,
      projectName: data.projectName || "",
      notes: data.notes || "",
      raisedBy: data.raisedBy || "",
      raisedAt: new Date().toISOString(),
    };
    try {
      await addMaintenance(finalData);
      setErrorMessage("");
      setSuccessMessage("Maintenance added successfully.");
      reset(defaultValues);
    } catch (e) {
      setSuccessMessage("");
      setErrorMessage("Failed to add maintenance. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg  p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">Enter Maintenance Details</h2>
      {successMessage && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium">
              Date *
            </label>
            <Input
              id="date"
              type="date"
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-destructive">
                {errors.date.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="time" className="mb-1 block text-sm font-medium">
              Time *
            </label>
            <Input
              id="time"
              type="time"
              {...register("time", { required: "Time is required" })}
            />
            {errors.time && (
              <p className="mt-1 text-xs text-destructive">
                {errors.time.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="orderNumber"
              className="mb-1 block text-sm font-medium"
            >
              Order Number
            </label>
            <Input
              id="orderNumber"
              placeholder="Order Number"
              {...register("orderNumber")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="customerName"
              className="mb-1 block text-sm font-medium"
            >
              Customer Name *
            </label>
            <Input
              id="customerName"
              placeholder="Customer Name"
              {...register("customerName", {
                required: "Customer Name is required",
              })}
            />
            {errors.customerName && (
              <p className="mt-1 text-xs text-destructive">
                {errors.customerName.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className="mb-1 block text-sm font-medium"
            >
              Phone Number *
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Phone Number"
              {...register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^\d{10,15}$/,
                  message: "Enter a valid phone number (10-15 digits)",
                },
              })}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-destructive">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="additionalPhoneNumber"
              className="mb-1 block text-sm font-medium"
            >
              Additional Phone
            </label>
            <Input
              id="additionalPhoneNumber"
              type="tel"
              placeholder="Additional Phone"
              {...register("additionalPhoneNumber")}
            />
          </div>
          <div>
            <label
              htmlFor="governorate"
              className="mb-1 block text-sm font-medium"
            >
              Governorate
            </label>
            <Input
              id="governorate"
              placeholder="Governorate"
              {...register("governorate")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium">
            Address
          </label>
          <Input
            id="address"
            placeholder="Address details"
            {...register("address")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="deviceType"
              className="mb-1 block text-sm font-medium"
            >
              Device Type
            </label>
            <Input
              id="deviceType"
              placeholder="Device Type"
              {...register("deviceType")}
            />
          </div>
          <div>
            <label
              htmlFor="deviceTypeCode"
              className="mb-1 block text-sm font-medium"
            >
              Device Code
            </label>
            <Input
              id="deviceTypeCode"
              placeholder="Device Code"
              {...register("deviceTypeCode")}
            />
          </div>
          <div>
            <label htmlFor="brand" className="mb-1 block text-sm font-medium">
              Brand
            </label>
            <Input id="brand" placeholder="Brand" {...register("brand")} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sup" className="mb-1 block text-sm font-medium">
              SUP
            </label>
            <Input id="sup" placeholder="SUP" {...register("sup")} />
          </div>
          <div>
            <label
              htmlFor="raisedBy"
              className="mb-1 block text-sm font-medium"
            >
              Raised By
            </label>
            <Input
              id="raisedBy"
              placeholder="User ID/Name"
              {...register("raisedBy")}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="defectDescription"
            className="mb-1 block text-sm font-medium"
          >
            Defect Description
          </label>
          <textarea
            id="defectDescription"
            placeholder="Describe the defect or issue..."
            {...register("defectDescription")}
            className="block min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isRelatedToProject"
            type="checkbox"
            {...register("isRelatedToProject")}
            className="h-4 w-4 accent-primary"
          />
          <label
            htmlFor="isRelatedToProject"
            className="cursor-pointer text-sm"
          >
            Related to Project
          </label>
        </div>

        {isRelatedToProject && (
          <div>
            <label
              htmlFor="projectName"
              className="mb-1 block text-sm font-medium"
            >
              Project Name
            </label>
            <Input
              id="projectName"
              placeholder="Enter project name"
              {...register("projectName")}
            />
          </div>
        )}

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            placeholder="Additional notes..."
            {...register("notes")}
            className="block min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <Button type="submit" className="mt-2">
          Submit Maintenance Data
        </Button>
      </form>
    </div>
  );
};

export default maintainanceform;

