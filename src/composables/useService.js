import api from "@/composables/useApi.js";

// ─── Helper: unwrap Laravel's standard { status, data: [...] } response ───────
const unwrap = (response) => {
    const body = response?.data;
    if (body && Array.isArray(body.data)) return body.data;
    if (body && body.data !== undefined) return body.data;
    return body;
};

export function useService() {

    // ── Auth / CSRF ────────────────────────────────────────────────────────
    const csrf = () => api.get("/sanctum/csrf-cookie");

    // ── Service Categories ─────────────────────────────────────────────────
    const getCategories = () =>
        api.get("/api/service-categories").then(unwrap);

    const getCategoryServices = (categoryId) =>
        api.get(`/api/services/${categoryId}`).then(unwrap);

    const getServiceDetails = (serviceId) =>
        api.get(`/api/services/${serviceId}`).then(unwrap);

    // ── Cart ───────────────────────────────────────────────────────────────
    const addToCart = (serviceId, quantity) =>
        api.post("/api/cart/add", { service_id: serviceId, quantity }).then(unwrap);

    const getCart = () =>
        api.get("/api/cart").then(unwrap);

    const updateCart = (serviceId, quantity) =>
        api.post("/api/cart/update", { service_id: serviceId, quantity }).then(unwrap);

    const removeFromCart = (serviceId) =>
        api.post("/api/cart/remove", { service_id: serviceId }).then(unwrap);

    const clearCart = () =>
        api.post("/api/cart/clear").then(unwrap);

    // ── Addresses ─────────────────────────────────────────────────────────
    const getAddresses = () =>
        api.get("/api/addresses").then(unwrap);

    const addAddress = (address) =>
        api.post("/api/addresses", address).then(unwrap);

    const updateAddress = (id, address) =>
        api.put(`/api/addresses/${id}`, address).then(unwrap);

    const deleteAddress = (id) =>
        api.delete(`/api/addresses/${id}`).then(unwrap);

    // ── Payment Methods ────────────────────────────────────────────────────
    const getPaymentMethods = () =>
        api.get("/api/payment-methods").then(unwrap);

    const addPaymentMethod = (paymentMethod) =>
        api.post("/api/payment-methods", paymentMethod).then(unwrap);

    const updatePaymentMethod = (id, paymentMethod) =>
        api.put(`/api/payment-methods/${id}`, paymentMethod).then(unwrap);

    const deletePaymentMethod = (id) =>
        api.delete(`/api/payment-methods/${id}`).then(unwrap);

    // ── Orders ─────────────────────────────────────────────────────────────
    const getOrders = () =>
        api.get("/api/orders").then(unwrap);

    const getOrder = (id) =>
        api.get(`/api/orders/${id}`).then(unwrap);

    const cancelOrder = (id) =>
        api.post(`/api/orders/${id}/cancel`).then(unwrap);

    // ── Bookings ───────────────────────────────────────────────────────────
    const addBooking = (booking) =>
        api.post("/api/bookings", booking).then(unwrap);

    const getBooking = (id) =>
        api.get(`/api/bookings/${id}`).then(unwrap);

    const cancelBooking = (id) =>
        api.post(`/api/bookings/${id}/cancel`).then(unwrap);

    const updateBooking = (id, booking) =>
        api.put(`/api/bookings/${id}`, booking).then(unwrap);

    const deleteBooking = (id) =>
        api.delete(`/api/bookings/${id}`).then(unwrap);

    // ── Reviews ────────────────────────────────────────────────────────────
    const getReviews = (bookingId) =>
        api.get(`/api/bookings/${bookingId}/reviews`).then(unwrap);

    const addReview = (bookingId, review) =>
        api.post(`/api/bookings/${bookingId}/reviews`, review).then(unwrap);

    const updateReview = (bookingId, reviewId, review) =>
        api.put(`/api/bookings/${bookingId}/reviews/${reviewId}`, review).then(unwrap);

    const deleteReview = (bookingId, reviewId) =>
        api.delete(`/api/bookings/${bookingId}/reviews/${reviewId}`).then(unwrap);

    // ── Ratings ────────────────────────────────────────────────────────────
    const getRatings = (serviceId) =>
        api.get(`/api/services/${serviceId}/ratings`).then(unwrap);

    const getRating = (serviceId, ratingId) =>
        api.get(`/api/services/${serviceId}/ratings/${ratingId}`).then(unwrap);

    const addRating = (serviceId, rating) =>
        api.post(`/api/services/${serviceId}/ratings`, rating).then(unwrap);

    const updateRating = (serviceId, ratingId, rating) =>
        api.put(`/api/services/${serviceId}/ratings/${ratingId}`, rating).then(unwrap);

    const deleteRating = (serviceId, ratingId) =>
        api.delete(`/api/services/${serviceId}/ratings/${ratingId}`).then(unwrap);

    return {
        csrf,
        // Categories
        getCategories,
        getCategoryServices,
        getServiceDetails,
        // Cart
        addToCart,
        getCart,
        updateCart,
        removeFromCart,
        clearCart,
        // Addresses
        getAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        // Payment Methods
        getPaymentMethods,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        // Orders
        getOrders,
        getOrder,
        cancelOrder,
        // Bookings
        addBooking,
        getBooking,
        cancelBooking,
        updateBooking,
        deleteBooking,
        // Reviews
        getReviews,
        addReview,
        updateReview,
        deleteReview,
        // Ratings
        getRatings,
        getRating,
        addRating,
        updateRating,
        deleteRating,
    };
}
