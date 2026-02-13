package events

import "time"

type Address struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Street      string `json:"street"`
	City        string `json:"city"`
	State       string `json:"state"`
	ZipCode     string `json:"zipCode"`
	Country     string `json:"country"`
	PhoneNumber string `json:"phoneNumber"`
}

type OrderPaidEvent struct {
	EventName string `json:"eventType"`
	Data      struct {
		OrderID     string  `json:"orderId"`
		UserID      string  `json:"userId"`
		UserEmail   string  `json:"userEmail"`
		UserName    string  `json:"userName"`
		TotalAmount float64 `json:"totalAmount"`
		Subtotal    float64 `json:"subtotal"`
		TaxedAmount float64 `json:"taxedAmount"`
		PaymentID   string  `json:"paymentId"`

		Items []struct {
			ProductID string  `json:"productId"`
			Name      string  `json:"name"`
			Price     float64 `json:"price"`
			Quantity  int     `json:"quantity"`
		} `json:"items"`

		ShippingAddress Address `json:"shippingAddress"`
		BillingAddress  Address `json:"billingAddress"`

		CreatedAt time.Time `json:"createdAt"`
	} `json:"data"`
}
