export default {
  common: {
    appName: "File Management System",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    search: "Search",
    back: "Back",
    next: "Next",
    submit: "Submit",
    close: "Close",
    clear: "Clear",
    confirm: "Confirm",
    retry: "Retry",
    yes: "Yes",
    no: "No",
    error: "Error",
    success: "Success",
    required: "Required",
    optional: "Optional",
    createdAt: "Created At",
    updatedAt: "Updated At",
    lastModified: "Last Modified"
  },
  auth: {
    signup: {
      title: "Create Account",
      subtitle: "Sign up to get started",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      submit: "Create Account",
      success: "Account created successfully. Please check your email for verification.",
      alreadyHaveAccount: "Already have an account?",
      login: "Log in"
    },
    verify: {
      title: "Verify Email",
      verifying: "Verifying your email...",
      success: "Email verified successfully. You can now log in.",
      error: "Verification failed. The link may be invalid or expired.",
      resend: "Resend Verification Email",
      resendSuccess: "Verification email sent. Please check your inbox."
    },
    login: {
      title: "Welcome Back",
      subtitle: "Log in to your account",
      email: "Email Address",
      password: "Password",
      submit: "Log In",
      success: "Login successful",
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      signup: "Sign up"
    },
    passwordReset: {
      title: "Reset Password",
      subtitle: "Enter your email to receive a reset code",
      email: "Email Address",
      sendOtp: "Send Reset Code",
      otpSent: "Password reset code sent to your email. Valid for 2 hours.",
      enterOtp: "Enter 6-digit code",
      otp: "Reset Code",
      verifyOtp: "Verify Code",
      verified: "Code verified. You can now reset your password.",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      resetPassword: "Reset Password",
      success: "Password reset successfully. You can now log in with your new password.",
      backToLogin: "Back to login"
    },
    logout: "Log Out"
  },
  validation: {
    required: "This field is required",
    maxLength: "Maximum {max} characters allowed",
    email: {
      invalid: "Please enter a valid email address",
      required: "Email is required"
    },
    password: {
      required: "Password is required",
      minLength: "Password must be at least 8 characters",
      weak: "Password must contain uppercase, lowercase, number, and special character",
      mismatch: "Passwords do not match"
    },
    otp: {
      invalid: "Please enter a valid 6-digit code",
      expired: "Reset code has expired",
      incorrect: "Incorrect reset code"
    }
  },
  error: {
    network: "Network error. Please check your connection.",
    server: "Server error. Please try again later.",
    unauthorized: "Unauthorized. Please log in again.",
    forbidden: "You don't have permission to perform this action.",
    notFound: "Resource not found.",
    conflict: "This resource already exists.",
    validation: "Please check your input and try again.",
    unknown: "An unknown error occurred.",
    user: {
      notFound: "User not found",
      alreadyExists: "A user with this email already exists",
      notVerified: "Please verify your email before logging in",
      alreadyVerified: "Your email is already verified"
    },
    login: {
      invalid: "Invalid email or password"
    },
    token: {
      missing: "Authentication token is missing",
      invalid: "Invalid authentication token",
      expired: "Your session has expired. Please log in again"
    }
  },
  search: {
    pageTitle: "Search",
    pageSubtitle: "Search for clients and cases",
    tabs: {
      clients: "Clients",
      cases: "Cases"
    },
    title: "Search Cases",
    byName: "By Name",
    byCaseId: "By Case ID",
    firstName: "First Name",
    lastName: "Last Name",
    caseId: "Case ID",
    searchButton: "Search",
    clearButton: "Clear",
    searching: "Searching...",
    noResults: "No cases found",
    noResultsHint: "Try adjusting your search criteria",
    resultsTitle: "Search Results",
    resultsCount: "{count} case(s) found",
    initialStateTitle: "Start Searching",
    initialStateHint: "Enter a name or case ID to search for cases",
    error: {
      title: "Search Error",
      generic: "Failed to search cases. Please try again."
    }
  },
  case: {
    clientInfo: "Client Information",
    clientName: "Client Name",
    clientEmail: "Email",
    clientPhone: "Phone Number",
    caseInfo: "Case Information",
    caseType: "Case Type",
    notes: "Notes",
    paymentInfo: "Payment Information",
    amountPaid: "Amount Paid",
    paymentStatus: "Payment Status",
    managementInfo: "Case Management",
    assignedTo: "Assigned To",
    dueDate: "Due Date",
    tasksRemaining: "Tasks Remaining",
    nextAction: "Next Action",
    comments: "Comments",
    viewDetails: "View Details",
    edit: "Edit Case",
    create: {
      title: "Create New Case",
      caseId: "Case ID",
      caseIdHint: "Alphanumeric characters, hyphens, and underscores only (1-100 characters)",
      createButton: "Create Case",
      creating: "Creating...",
      success: "Case created successfully",
      validation: {
        length: "Case ID must be 1-100 characters long",
        format: "Case ID can only contain letters, numbers, hyphens, and underscores"
      },
      error: {
        duplicate: "A case with this ID already exists for this client",
        missingFields: "Case ID is required",
        invalidFormat: "Case ID must be 1-100 characters and contain only letters, numbers, hyphens, and underscores"
      }
    }
  },
  edit: {
    pageTitle: "Edit Case",
    pageSubtitle: "Update case metadata with automatic audit tracking",
    title: "Edit Case Information",
    loading: "Loading case data...",
    sections: {
      clientInfo: "Client Information",
      paymentInfo: "Payment Information",
      caseManagement: "Case Management",
      comments: "Comments",
      folderInfo: "Folder Information"
    },
    fields: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      amountPaid: "Amount Paid",
      paymentStatus: "Payment Status",
      assignedTo: "Assigned To",
      dueDate: "Due Date",
      status: "Status",
      tasksRemaining: "Tasks Remaining",
      nextAction: "Next Action",
      comment: "Comments",
      folderName: "Folder Name",
      folderPath: "Folder Path"
    },
    conflict: {
      title: "Version Conflict",
      message: "This case was modified by another user. Please refresh to get the latest version and try again.",
      cancel: "Cancel",
      refresh: "Refresh Data"
    },
    error: {
      title: "Error Loading Case",
      generic: "Failed to load case data. Please try again."
    }
  },
  metadata: {
    search: {
      title: "Search Cases",
      placeholder: "Search by name or case ID",
      noResults: "No cases found",
      results: "{count} case(s) found"
    },
    case: {
      id: "Case ID",
      name: "Case Name",
      client: "Client Name",
      assignedTo: "Assigned To",
      type: "Case Type",
      status: "Status",
      notes: "Notes",
      createdBy: "Created By",
      createdAt: "Created At",
      assignedAt: "Assigned At",
      lastUpdatedBy: "Last Updated By",
      lastUpdatedAt: "Last Updated At"
    },
    edit: {
      title: "Edit Case",
      save: "Save Changes",
      success: "Case updated successfully",
      conflict: "This case was updated by someone else. Please refresh and try again."
    },
    create: {
      title: "Create Case",
      caseId: "Case ID",
      caseIdHint: "Alphanumeric characters, hyphens, and underscores only (1-100 characters)",
      createButton: "Create Case",
      submit: "Create Case",
      success: "Case created successfully",
      validation: {
        length: "Case ID must be 1-100 characters long",
        format: "Case ID can only contain letters, numbers, hyphens, and underscores"
      }
    }
  },
  success: {
    caseCreated: "Case created successfully",
    caseUpdated: "Case updated successfully",
    clientUpdated: "Client information updated successfully",
    fileUploaded: "File uploaded successfully",
    filesRefreshed: "Files refreshed"
  },
  files: {
    case: {
      title: "Case Files",
      subtitle: "Manage files for this case"
    },
    browse: {
      title: "Files",
      empty: "No files in this folder",
      emptyHint: "Upload files using the form above"
    },
    rename: {
      success: "File renamed successfully",
      error: "Failed to rename file"
    },
    management: {
      pageTitle: "File Management",
      pageSubtitle: "Upload files, create case folders, and manage file operations",
      tabs: {
        upload: "Upload Files",
        caseFolder: "Case Folders",
        browse: "Browse Files"
      },
      recentUpload: "Recently Uploaded File",
      recentCaseFolder: "Recently Created Case Folder",
      browseFiles: "Browse Files",
      browseHint: "File browsing functionality coming soon"
    },
    upload: {
      title: "Upload File",
      folderId: "Folder ID",
      selectFile: "Select File",
      dragDrop: "Drag & drop file here",
      or: "or",
      uploading: "Uploading...",
      uploadButton: "Upload File",
      success: "File uploaded successfully",
      maxSize: "Maximum file size: 10MB",
      fileName: "File Name",
      fileSize: "File Size",
      uploadedAt: "Uploaded At",
      fileId: "File ID",
      error: {
        size: "File exceeds maximum size of 10MB",
        filename: "File name contains invalid characters",
        generic: "Failed to upload file"
      }
    },
    conflict: {
      title: "File Already Exists",
      message: "A file with this name already exists. How would you like to proceed?",
      fileName: "File Name",
      cancelled: "Upload cancelled",
      overwriteSuccess: "File overwritten successfully",
      renameSuccess: "File uploaded as {fileName}",
      error: "Failed to resolve file conflict",
      options: {
        overwrite: {
          title: "Overwrite",
          description: "Replace the existing file with the new one"
        },
        rename: {
          title: "Rename",
          description: "Upload with a new name (timestamp will be added)"
        },
        cancel: {
          title: "Cancel",
          description: "Do not upload this file"
        }
      }
    },
    caseFolder: {
      title: "Create Case Folder",
      hint: "Create a new case folder within an existing client folder",
      clientFolderId: "Client Folder ID",
      caseId: "Case ID",
      createButton: "Create Case Folder",
      createSuccess: "Case folder created successfully",
      createError: "Failed to create case folder",
      folderName: "Folder Name",
      folderPath: "Folder Path",
      folderId: "Folder ID",
      createdAt: "Created At",
      existingFolderId: "Existing Folder ID",
      existsDialog: {
        title: "Case Folder Already Exists",
        message: "A case folder with this ID already exists in the client folder."
      }
    },
    folder: {
      create: "Create Folder",
      client: "Create Client Folder",
      case: "Create Case Folder",
      success: "Folder created successfully"
    },
    client: {
      pageTitle: "Client Folder Management",
      pageSubtitle: "Search for existing client folders or create new ones",
      title: "Manage Client Folders",
      searchSection: "Search for Client Folder",
      searchHint: "Search by client name and ID card number to check if a folder already exists",
      createSection: "Create New Client Folder",
      createHint: "Fill in all required fields to create a new client folder in Google Drive",
      firstName: "First Name",
      lastName: "Last Name",
      idCardNo: "ID Card Number",
      telephone: "Telephone",
      email: "Email Address",
      searchButton: "Search Folder",
      createButton: "Create Folder",
      folderFound: "Client Folder Found",
      folderNotFound: "Client Folder Not Found",
      canCreate: "You can create a new folder using the form below",
      folderPath: "Folder Path",
      folderName: "Folder Name",
      folderId: "Folder ID",
      createdAt: "Created At",
      createdBy: "Created By",
      searchSuccess: "Folder found successfully",
      searchError: "Failed to search for folder",
      createSuccess: "Client folder created successfully",
      createError: "Failed to create client folder",
      recentFolder: "Recently Created/Found Folder",
      openFolder: "Open in Google Drive",
      copyFolderId: "Copy Folder ID",
      existsDialog: {
        title: "Folder Already Exists",
        message: "A client folder with this name already exists. Please search for it first or use different client information."
      }
    },
    delete: {
      title: "Delete File",
      confirm: "Are you sure you want to delete this file? This action cannot be undone.",
      success: "File deleted successfully",
      error: "Failed to delete file"
    },
    navigate: {
      breadcrumb: "Navigation",
      files: "Files",
      folders: "Folders",
      folderId: "Folder ID",
      reload: "Reload",
      error: "Failed to load folder contents",
      summary: "{folders} folders, {files} files",
      empty: "This folder is empty"
    },
    download: {
      button: "Download",
      success: "Downloading {fileName}...",
      error: "Failed to download file"
    }
  },
  navigation: {
    home: "Home",
    root: "Root",
    search: "Search",
    cases: "Cases",
    files: "Files",
    admin: "Admin",
    profile: "Profile"
  },
  dashboard: {
    welcome: "Welcome to Dashboard",
    successLogin: "You are successfully logged in!",
    user: "User",
    role: "Role"
  },
  language: {
    switch: "Switch Language",
    en: "English",
    fr: "Français"
  },
  client: {
    search: {
      title: "Search Clients",
      subtitle: "Find existing clients or create new ones",
      firstName: "First Name",
      lastName: "Last Name",
      nationalId: "National ID",
      searchButton: "Search",
      clearButton: "Clear",
      searching: "Searching...",
      noResults: "No clients found",
      noResultsHint: "Try adjusting your search criteria or create a new client",
      createNew: "Create New Client",
      results: "{count} client(s) found",
      error: {
        missingCriteria: "Please enter at least one search criterion",
        generic: "Failed to search clients. Please try again."
      }
    },
    view: {
      tooltip: "View client details"
    },
    createCase: {
      tooltip: "Create new case for this client"
    },
    create: {
      title: "Create New Client",
      subtitle: "Add a new client to the system",
      comingSoon: "Client creation form will be available in Phase 4",
      firstName: "First Name",
      lastName: "Last Name",
      nationalId: "National ID",
      telephone: "Telephone",
      email: "Email Address",
      createButton: "Create Client",
      creating: "Creating...",
      success: "Client created successfully",
      error: {
        duplicate: "A client with this National ID already exists",
        missingFields: "First name, last name, and national ID are required"
      }
    },
    details: {
      title: "Client Details",
      subtitle: "View and manage client information",
      notFound: "Client not found",
      personalInfo: "Personal Information",
      firstName: "First Name",
      lastName: "Last Name",
      nationalId: "National ID",
      telephone: "Telephone",
      email: "Email",
      folderId: "Folder ID",
      cases: "Cases",
      noCases: "No cases found for this client",
      createCase: "Create New Case",
      caseId: "Case ID",
      fileCount: "{count} file(s)"
    }
  },
  caseFolder: {
    create: {
      title: "Create New Case",
      caseId: "Case ID",
      createButton: "Create Case",
      creating: "Creating...",
      success: "Case created successfully",
      error: {
        duplicate: "A case with this ID already exists for this client",
        missingFields: "Case ID is required"
      }
    }
  },
  fileUpload: {
    title: "Upload Files",
    selectFiles: "Select Files",
    dragDrop: "Drag and drop files here",
    or: "or",
    browse: "Browse",
    displayName: "Display Name (optional)",
    uploadButton: "Upload",
    uploading: "Uploading {current} of {total}...",
    progress: "{percent}%",
    success: "File uploaded successfully",
    allSuccess: "All files uploaded successfully",
    someSuccess: "{count} of {total} files uploaded successfully",
    error: {
      size: "File exceeds maximum size of 10MB",
      filename: "File name contains invalid characters",
      generic: "Failed to upload file"
    }
  },
  fileDownload: {
    button: "Download",
    downloading: "Downloading {fileName}...",
    success: "File downloaded successfully",
    error: "Failed to download file"
  },
  fileDelete: {
    button: "Delete",
    confirm: "Are you sure you want to delete this file?",
    confirmTitle: "Delete File",
    confirmMessage: "This action cannot be undone. The file will be permanently deleted.",
    deleting: "Deleting...",
    success: "File deleted successfully",
    error: "Failed to delete file"
  },
  fileRename: {
    button: "Rename",
    title: "Rename File",
    newName: "New Name",
    renameButton: "Rename",
    renaming: "Renaming...",
    hint: "Invalid characters: < > : \" / \\ | ? *",
    success: "File renamed successfully",
    error: {
      required: "File name is required",
      invalidChars: "File name contains invalid characters",
      sameAsOld: "New name must be different from current name",
      generic: "Failed to rename file"
    }
  },
  fileList: {
    loading: "Loading...",
    empty: "This folder is empty",
    filesLabel: "Files",
    foldersLabel: "Folders",
    itemCount: "{count} item(s)",
    lastModified: "Last modified",
    size: "Size",
    name: "Name",
    type: "Type"
  },
  folderDelete: {
    button: "Delete Folder",
    confirm: "Type DELETE to confirm",
    confirmTitle: "Delete Folder",
    confirmMessage: "This will permanently delete the folder and all its contents. This action cannot be undone.",
    typeDelete: "Type DELETE to confirm:",
    invalidConfirmation: "You must type DELETE to confirm deletion",
    deleting: "Deleting...",
    success: "Folder deleted successfully",
    error: "Failed to delete folder"
  },
  breadcrumb: {
    home: "Home",
    cases: "Cases"
  },
  emailDialog: {
    title: "Send Status Update Email?",
    message: "Would you like to notify the client about this status change?",
    languageLabel: "Client language:",
    languageEnglish: "English",
    languageFrench: "French",
    notesRequired: "Please update the notes field to provide context for this notification",
    btnYes: "Yes, send email",
    btnNo: "No, update case only",
    btnCancel: "Cancel",
    successSent: "Case updated and email notification sent",
    successNoEmail: "Case updated successfully",
    warnNoEmail: "Case updated but client has no email address",
    errorEmailFailed: "Case updated but email notification failed to send"
  },
  session: {
    expiring: {
      title: "Session Expiring Soon",
      message: "Your session will expire in {time}. Would you like to extend it?",
      countdown: "Time Remaining",
      extendButton: "Extend Session",
      logoutButton: "Logout Now"
    }
  },
  token: {
    refresh: {
      error: "Failed to extend session. Please try again."
    }
  }
};
