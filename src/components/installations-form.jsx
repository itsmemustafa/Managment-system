import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { addInstallation } from "../db/dbService.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const defaultValues = {
  date: new Date().toISOString().substring(0, 10),
  orderNumber: "",
  governorate: "",
  customerName: "",
  address: "",
  phoneNumber: "",
  productModel: "",
  brand: "",
  quantity: 1,
  sup: "",
  notes: "",
  raisedBy: "",
};

const installationsForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (data) => {
    const finalData = {
      ...data,
      raisedAt: new Date().toISOString(),
    };
    try {
      await addInstallation(finalData);
      setErrorMessage("");
      setSuccessMessage("Installation added successfully.");
      reset(defaultValues);
    } catch (e) {
      setSuccessMessage("");
      setErrorMessage("Failed to add installation. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl    ">
      <h2 className="mb-6 text-xl font-semibold">Enter Installation Details</h2>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <label
              htmlFor="orderNumber"
              className="mb-1 block text-sm font-medium"
            >
              Order Number (Optional)
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
                  message: "Enter a valid phone number (digits only)",
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

        <div className="grid grid-cols-1 gap-4">
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
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="productModel"
              className="mb-1 block text-sm font-medium"
            >
              Product Model
            </label>
            <Input
              id="productModel"
              placeholder="Model"
              {...register("productModel")}
            />
          </div>
          <div>
            <label htmlFor="brand" className="mb-1 block text-sm font-medium">
              Brand
            </label>
            <Input id="brand" placeholder="Brand" {...register("brand")} />
          </div>
          <div>
            <label
              htmlFor="quantity"
              className="mb-1 block text-sm font-medium"
            >
              Qty
            </label>
            <Input
              id="quantity"
              type="number"
              placeholder="Qty"
              {...register("quantity", {
                min: { value: 1, message: "Min Qty is 1" },
                valueAsNumber: true,
              })}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-destructive">
                {errors.quantity.message}
              </p>
            )}
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
          Submit Installation Data
        </Button>
      </form>
    </div>
  );
};

export default installationsForm;

