import Swal from "sweetalert2";

/**
 * Custom SweetAlert2 Utility
 * --------------------------
 * Didesain khusus untuk MLAKUBARENG agar font, warna, & tombol modal
 * 100% seragam dengan tema aplikasi (DaisyUI & Font Poppins).
 */

// 1. Toast Notification (Notifikasi Pojok Kanan Atas)
export const showSuccessToast = (message: string) => {
  return Swal.fire({
    title: message,
    icon: "success",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup:
        "font-sans rounded-xl border border-base-300 bg-base-100 text-base-content shadow-xl !text-sm font-semibold",
    },
  });
};

export const showErrorToast = (message: string) => {
  return Swal.fire({
    title: message,
    icon: "error",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    customClass: {
      popup:
        "font-sans rounded-xl border border-base-300 bg-base-100 text-base-content shadow-xl !text-sm font-semibold",
    },
  });
};

// 2. Alert Modal Validasi / Error / Informasi
export const showAlert = ({
  title,
  text,
  icon = "info",
  confirmButtonText = "Mengerti",
}: {
  title: string;
  text?: string;
  icon?: "success" | "error" | "warning" | "info" | "question";
  confirmButtonText?: string;
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText,
    buttonsStyling: false,
    customClass: {
      popup:
        "font-sans bg-base-100 text-base-content border border-base-300 rounded-2xl shadow-2xl p-6",
      title: "font-bold !text-sm text-base-content",
      htmlContainer: "!text-sm text-base-content/70 mt-2",
      confirmButton: "btn btn-primary font-semibold px-6 rounded-lg shadow-xs !text-sm",
    },
  });
};

export const showErrorAlert = (title: string, text?: string) => {
  return showAlert({
    title,
    text,
    icon: "error",
    confirmButtonText: "Tutup",
  });
};

export const showSuccessAlert = (title: string, text?: string) => {
  return showAlert({
    title,
    text,
    icon: "success",
    confirmButtonText: "Selesai",
  });
};

// 3. Confirm Modal (Konfirmasi Hapus / Tindakan Penting)
export const showConfirmModal = ({
  title,
  text,
  confirmButtonText = "Ya, Hapus",
  cancelButtonText = "Batal",
  isDanger = true,
}: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDanger?: boolean;
}) => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    buttonsStyling: false,
    reverseButtons: true,
    customClass: {
      popup:
        "font-sans bg-base-100 text-base-content border border-base-300 rounded-2xl shadow-2xl p-6",
      title: "font-bold !text-xl text-base-content",
      htmlContainer: "!text-sm text-base-content/70 mt-2",
      confirmButton: isDanger
        ? "btn btn-error font-semibold px-6 rounded-lg shadow-xs !text-sm"
        : "btn btn-primary font-semibold px-6 rounded-lg shadow-xs !text-sm",
      cancelButton: "btn btn-ghost font-semibold px-6 rounded-lg mr-2 !text-sm",
    },
  });
};
