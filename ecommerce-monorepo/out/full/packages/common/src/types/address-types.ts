export type Address = {
  id: string;
  createdAt: Date;
  userId: string;
  name: string | null;
  updatedAt: Date;
  isDefault: boolean;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string | null;
};
