export default {
  common: {
    appName: "Système de Gestion de Fichiers",
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    search: "Rechercher",
    back: "Retour",
    next: "Suivant",
    submit: "Soumettre",
    close: "Fermer",
    confirm: "Confirmer",
    yes: "Oui",
    no: "Non",
    error: "Erreur",
    success: "Succès",
    required: "Requis",
    optional: "Optionnel",
    createdAt: "Créé le",
    updatedAt: "Mis à jour le",
    lastModified: "Dernière modification"
  },
  auth: {
    signup: {
      title: "Créer un Compte",
      subtitle: "Inscrivez-vous pour commencer",
      email: "Adresse Email",
      password: "Mot de Passe",
      confirmPassword: "Confirmer le Mot de Passe",
      submit: "Créer un Compte",
      success: "Compte créé avec succès. Veuillez vérifier votre email pour la vérification.",
      alreadyHaveAccount: "Vous avez déjà un compte?",
      login: "Se connecter"
    },
    verify: {
      title: "Vérifier l'Email",
      verifying: "Vérification de votre email...",
      success: "Email vérifié avec succès. Vous pouvez maintenant vous connecter.",
      error: "Échec de la vérification. Le lien peut être invalide ou expiré.",
      resend: "Renvoyer l'Email de Vérification",
      resendSuccess: "Email de vérification envoyé. Veuillez vérifier votre boîte de réception."
    },
    login: {
      title: "Bienvenue",
      subtitle: "Connectez-vous à votre compte",
      email: "Adresse Email",
      password: "Mot de Passe",
      submit: "Se Connecter",
      success: "Connexion réussie",
      forgotPassword: "Mot de passe oublié?",
      noAccount: "Vous n'avez pas de compte?",
      signup: "S'inscrire"
    },
    passwordReset: {
      title: "Réinitialiser le Mot de Passe",
      subtitle: "Entrez votre email pour recevoir un code de réinitialisation",
      email: "Adresse Email",
      sendOtp: "Envoyer le Code",
      otpSent: "Code de réinitialisation envoyé à votre email. Valide pendant 2 heures.",
      enterOtp: "Entrez le code à 6 chiffres",
      otp: "Code de Réinitialisation",
      verifyOtp: "Vérifier le Code",
      verified: "Code vérifié. Vous pouvez maintenant réinitialiser votre mot de passe.",
      newPassword: "Nouveau Mot de Passe",
      confirmPassword: "Confirmer le Nouveau Mot de Passe",
      resetPassword: "Réinitialiser le Mot de Passe",
      success: "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
      backToLogin: "Retour à la connexion"
    },
    logout: "Se Déconnecter"
  },
  validation: {
    required: "Ce champ est requis",
    email: {
      invalid: "Veuillez entrer une adresse email valide",
      required: "L'email est requis"
    },
    password: {
      required: "Le mot de passe est requis",
      minLength: "Le mot de passe doit contenir au moins 8 caractères",
      weak: "Le mot de passe doit contenir des majuscules, minuscules, chiffres et caractères spéciaux",
      mismatch: "Les mots de passe ne correspondent pas"
    },
    otp: {
      invalid: "Veuillez entrer un code à 6 chiffres valide",
      expired: "Le code de réinitialisation a expiré",
      incorrect: "Code de réinitialisation incorrect"
    }
  },
  error: {
    network: "Erreur réseau. Veuillez vérifier votre connexion.",
    server: "Erreur serveur. Veuillez réessayer plus tard.",
    unauthorized: "Non autorisé. Veuillez vous reconnecter.",
    forbidden: {
      default: "Vous n'avez pas la permission d'effectuer cette action.",
      adminOnly: "Rôle d'administrateur requis"
    },
    notFound: "Ressource non trouvée.",
    conflict: "Cette ressource existe déjà.",
    validation: "Veuillez vérifier votre saisie et réessayer.",
    unknown: "Une erreur inconnue s'est produite.",
    user: {
      notFound: "Utilisateur non trouvé",
      alreadyExists: "Un utilisateur avec cet email existe déjà",
      notVerified: "Veuillez vérifier votre email avant de vous connecter",
      alreadyVerified: "Votre email est déjà vérifié"
    },
    login: {
      invalid: "Email ou mot de passe invalide"
    },
    token: {
      missing: "Jeton d'authentification manquant",
      invalid: "Jeton d'authentification invalide",
      expired: "Votre session a expiré. Veuillez vous reconnecter"
    }
  },
  search: {
    pageTitle: "Rechercher des Dossiers",
    pageSubtitle: "Rechercher des dossiers clients par nom ou ID de dossier",
    title: "Rechercher des Dossiers",
    byName: "Par Nom",
    byCaseId: "Par ID de Dossier",
    firstName: "Prénom",
    lastName: "Nom de Famille",
    caseId: "ID du Dossier",
    searchButton: "Rechercher",
    clearButton: "Effacer",
    searching: "Recherche en cours...",
    noResults: "Aucun dossier trouvé",
    noResultsHint: "Essayez d'ajuster vos critères de recherche",
    resultsTitle: "Résultats de Recherche",
    resultsCount: "{count} dossier(s) trouvé(s)",
    initialStateTitle: "Commencer la Recherche",
    initialStateHint: "Entrez un nom ou un ID de dossier pour rechercher des dossiers",
    error: {
      title: "Erreur de Recherche",
      generic: "Échec de la recherche de dossiers. Veuillez réessayer."
    }
  },
  case: {
    clientInfo: "Informations Client",
    clientName: "Nom du Client",
    clientEmail: "Email",
    clientPhone: "Numéro de Téléphone",
    paymentInfo: "Informations de Paiement",
    amountPaid: "Montant Payé",
    paymentStatus: "Statut du Paiement",
    managementInfo: "Gestion du Dossier",
    assignedTo: "Assigné à",
    dueDate: "Date d'Échéance",
    tasksRemaining: "Tâches Restantes",
    nextAction: "Prochaine Action",
    comments: "Commentaires",
    viewDetails: "Voir les Détails",
    edit: "Modifier le Dossier",
    create: {
      title: "Créer un Nouveau Dossier",
      caseId: "ID du Dossier",
      caseIdHint: "Caractères alphanumériques, tirets et traits de soulignement uniquement (1-100 caractères)",
      createButton: "Créer le Dossier",
      creating: "Création en cours...",
      success: "Dossier créé avec succès",
      validation: {
        length: "L'ID du dossier doit contenir entre 1 et 100 caractères",
        format: "L'ID du dossier ne peut contenir que des lettres, chiffres, tirets et traits de soulignement"
      },
      error: {
        duplicate: "Un dossier avec cet ID existe déjà pour ce client",
        missingFields: "L'ID du dossier est requis",
        invalidFormat: "L'ID du dossier doit contenir entre 1 et 100 caractères et uniquement des lettres, chiffres, tirets et traits de soulignement"
      }
    }
  },
  edit: {
    pageTitle: "Modifier le Dossier",
    pageSubtitle: "Mettre à jour les métadonnées du dossier avec suivi d'audit automatique",
    title: "Modifier les Informations du Dossier",
    loading: "Chargement des données du dossier...",
    sections: {
      clientInfo: "Informations Client",
      paymentInfo: "Informations de Paiement",
      caseManagement: "Gestion du Dossier",
      comments: "Commentaires",
      folderInfo: "Informations du Dossier"
    },
    fields: {
      firstName: "Prénom",
      lastName: "Nom de Famille",
      email: "Adresse Email",
      phone: "Numéro de Téléphone",
      amountPaid: "Montant Payé",
      paymentStatus: "Statut du Paiement",
      assignedTo: "Assigné à",
      dueDate: "Date d'Échéance",
      status: "Statut",
      tasksRemaining: "Tâches Restantes",
      nextAction: "Prochaine Action",
      comment: "Commentaires",
      folderName: "Nom du Dossier",
      folderPath: "Chemin du Dossier"
    },
    conflict: {
      title: "Conflit de Version",
      message: "Ce dossier a été modifié par un autre utilisateur. Veuillez actualiser pour obtenir la dernière version et réessayer.",
      cancel: "Annuler",
      refresh: "Actualiser les Données"
    },
    error: {
      title: "Erreur de Chargement du Dossier",
      generic: "Échec du chargement des données du dossier. Veuillez réessayer."
    }
  },
  metadata: {
    search: {
      title: "Rechercher des Dossiers",
      placeholder: "Rechercher par nom ou ID de dossier",
      noResults: "Aucun dossier trouvé",
      results: "{count} dossier(s) trouvé(s)"
    },
    case: {
      id: "ID du Dossier",
      name: "Nom du Dossier",
      client: "Nom du Client",
      assignedTo: "Assigné à",
      type: "Type de Dossier",
      status: "Statut",
      notes: "Notes",
      createdBy: "Créé par",
      createdAt: "Créé le",
      assignedAt: "Assigné le",
      lastUpdatedBy: "Dernière mise à jour par",
      lastUpdatedAt: "Dernière mise à jour le"
    },
    edit: {
      title: "Modifier le Dossier",
      save: "Enregistrer les Modifications",
      success: "Dossier mis à jour avec succès",
      conflict: "Ce dossier a été modifié par quelqu'un d'autre. Veuillez actualiser et réessayer."
    },
    create: {
      title: "Créer un Dossier",
      submit: "Créer le Dossier",
      success: "Dossier créé avec succès"
    }
  },
  files: {
    case: {
      title: "Fichiers du Cas",
      subtitle: "Gérer les fichiers de ce cas"
    },
    browse: {
      title: "Fichiers",
      empty: "Aucun fichier dans ce dossier",
      emptyHint: "Téléchargez des fichiers en utilisant le formulaire ci-dessus"
    },
    rename: {
      success: "Fichier renommé avec succès",
      error: "Échec du renommage du fichier"
    },
    management: {
      pageTitle: "Gestion des Fichiers",
      pageSubtitle: "Télécharger des fichiers, créer des dossiers de cas et gérer les opérations de fichiers",
      tabs: {
        upload: "Télécharger des Fichiers",
        caseFolder: "Dossiers de Cas",
        browse: "Parcourir les Fichiers"
      },
      recentUpload: "Fichier Récemment Téléchargé",
      recentCaseFolder: "Dossier de Cas Récemment Créé",
      browseFiles: "Parcourir les Fichiers",
      browseHint: "Fonctionnalité de navigation des fichiers à venir"
    },
    upload: {
      title: "Télécharger un Fichier",
      folderId: "ID du Dossier",
      selectFile: "Sélectionner un Fichier",
      dragDrop: "Glissez-déposez le fichier ici",
      or: "ou",
      uploading: "Téléchargement...",
      uploadButton: "Télécharger le Fichier",
      success: "Fichier téléchargé avec succès",
      maxSize: "Taille maximale du fichier: 10 Mo",
      fileName: "Nom du Fichier",
      fileSize: "Taille du Fichier",
      uploadedAt: "Téléchargé le",
      fileId: "ID du Fichier",
      error: {
        size: "Le fichier dépasse la taille maximale de 10 Mo",
        filename: "Le nom du fichier contient des caractères invalides",
        generic: "Échec du téléchargement du fichier"
      }
    },
    conflict: {
      title: "Le Fichier Existe Déjà",
      message: "Un fichier avec ce nom existe déjà. Comment souhaitez-vous procéder?",
      fileName: "Nom du Fichier",
      cancelled: "Téléchargement annulé",
      overwriteSuccess: "Fichier écrasé avec succès",
      renameSuccess: "Fichier téléchargé sous {fileName}",
      error: "Échec de la résolution du conflit de fichier",
      options: {
        overwrite: {
          title: "Écraser",
          description: "Remplacer le fichier existant par le nouveau"
        },
        rename: {
          title: "Renommer",
          description: "Télécharger avec un nouveau nom (horodatage ajouté)"
        },
        cancel: {
          title: "Annuler",
          description: "Ne pas télécharger ce fichier"
        }
      }
    },
    caseFolder: {
      title: "Créer un Dossier de Cas",
      hint: "Créer un nouveau dossier de cas dans un dossier client existant",
      clientFolderId: "ID du Dossier Client",
      caseId: "ID du Cas",
      createButton: "Créer le Dossier de Cas",
      createSuccess: "Dossier de cas créé avec succès",
      createError: "Échec de la création du dossier de cas",
      folderName: "Nom du Dossier",
      folderPath: "Chemin du Dossier",
      folderId: "ID du Dossier",
      createdAt: "Créé le",
      existingFolderId: "ID du Dossier Existant",
      existsDialog: {
        title: "Le Dossier de Cas Existe Déjà",
        message: "Un dossier de cas avec cet ID existe déjà dans le dossier client."
      }
    },
    folder: {
      create: "Créer un Dossier",
      client: "Créer un Dossier Client",
      case: "Créer un Dossier de Cas",
      success: "Dossier créé avec succès"
    },
    client: {
      pageTitle: "Gestion des Dossiers Clients",
      pageSubtitle: "Rechercher des dossiers clients existants ou en créer de nouveaux",
      title: "Gérer les Dossiers Clients",
      searchSection: "Rechercher un Dossier Client",
      searchHint: "Rechercher par nom de client et numéro de carte d'identité pour vérifier si un dossier existe déjà",
      createSection: "Créer un Nouveau Dossier Client",
      createHint: "Remplissez tous les champs requis pour créer un nouveau dossier client dans Google Drive",
      firstName: "Prénom",
      lastName: "Nom de Famille",
      idCardNo: "Numéro de Carte d'Identité",
      telephone: "Téléphone",
      email: "Adresse Email",
      searchButton: "Rechercher le Dossier",
      createButton: "Créer le Dossier",
      folderFound: "Dossier Client Trouvé",
      folderNotFound: "Dossier Client Non Trouvé",
      canCreate: "Vous pouvez créer un nouveau dossier en utilisant le formulaire ci-dessous",
      folderPath: "Chemin du Dossier",
      folderName: "Nom du Dossier",
      folderId: "ID du Dossier",
      createdAt: "Créé le",
      createdBy: "Créé par",
      searchSuccess: "Dossier trouvé avec succès",
      searchError: "Échec de la recherche du dossier",
      createSuccess: "Dossier client créé avec succès",
      createError: "Échec de la création du dossier client",
      recentFolder: "Dossier Récemment Créé/Trouvé",
      openFolder: "Ouvrir dans Google Drive",
      copyFolderId: "Copier l'ID du Dossier",
      existsDialog: {
        title: "Le Dossier Existe Déjà",
        message: "Un dossier client avec ce nom existe déjà. Veuillez d'abord le rechercher ou utiliser des informations client différentes."
      }
    },
    delete: {
      title: "Supprimer le Fichier",
      confirm: "Êtes-vous sûr de vouloir supprimer ce fichier? Cette action ne peut pas être annulée.",
      success: "Fichier supprimé avec succès",
      error: "Échec de la suppression du fichier"
    },
    navigate: {
      breadcrumb: "Navigation",
      files: "Fichiers",
      folders: "Dossiers",
      folderId: "ID du Dossier",
      reload: "Recharger",
      error: "Échec du chargement du contenu du dossier",
      summary: "{folders} dossiers, {files} fichiers",
      empty: "Ce dossier est vide"
    },
    download: {
      button: "Télécharger",
      success: "Téléchargement de {fileName}...",
      error: "Échec du téléchargement du fichier"
    }
  },
  navigation: {
    home: "Accueil",
    root: "Racine",
    search: "Rechercher",
    cases: "Dossiers",
    files: "Fichiers",
    admin: "Admin",
    profile: "Profil"
  },
  dashboard: {
    welcome: "Bienvenue au Tableau de Bord",
    successLogin: "Vous êtes connecté avec succès!",
    user: "Utilisateur",
    role: "Rôle"
  },
  language: {
    switch: "Changer de Langue",
    en: "English",
    fr: "Français"
  },
  client: {
    search: {
      title: "Rechercher des Clients",
      subtitle: "Trouver des clients existants ou en créer de nouveaux",
      firstName: "Prénom",
      lastName: "Nom de Famille",
      nationalId: "Numéro d'Identité Nationale",
      searchButton: "Rechercher",
      clearButton: "Effacer",
      searching: "Recherche en cours...",
      noResults: "Aucun client trouvé",
      createNew: "Créer un Nouveau Client",
      results: "{count} client(s) trouvé(s)"
    },
    create: {
      title: "Créer un Nouveau Client",
      subtitle: "Ajouter un nouveau client au système",
      firstName: "Prénom",
      lastName: "Nom de Famille",
      nationalId: "Numéro d'Identité Nationale",
      telephone: "Téléphone",
      email: "Adresse Email",
      createButton: "Créer le Client",
      creating: "Création en cours...",
      success: "Client créé avec succès",
      error: {
        duplicate: "Un client avec ce numéro d'identité nationale existe déjà",
        missingFields: "Le prénom, le nom de famille et le numéro d'identité nationale sont requis"
      }
    },
    details: {
      title: "Détails du Client",
      subtitle: "Voir et gérer les informations du client",
      notFound: "Client non trouvé",
      personalInfo: "Informations Personnelles",
      firstName: "Prénom",
      lastName: "Nom de Famille",
      nationalId: "Numéro d'Identité Nationale",
      telephone: "Téléphone",
      email: "Email",
      folderId: "ID du Dossier",
      cases: "Dossiers",
      noCases: "Aucun dossier trouvé pour ce client",
      createCase: "Créer un Nouveau Dossier",
      caseId: "ID du Dossier",
      fileCount: "{count} fichier(s)"
    },
    edit: {
      title: "Modifier les Informations du Client",
      editButton: "Modifier",
      saveButton: "Enregistrer les Modifications",
      cancelButton: "Annuler",
      saving: "Enregistrement en cours...",
      success: "Informations du client mises à jour avec succès",
      unsavedChanges: "Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir annuler?",
      error: {
        missingClientId: "L'ID du client est requis",
        missingFields: "Le prénom, le nom de famille et le numéro d'identité nationale sont requis",
        validation: "Veuillez vérifier votre saisie et réessayer",
        invalidEmail: "Veuillez entrer une adresse email valide",
        duplicateNationalId: "Ce numéro d'identité nationale est déjà enregistré pour un autre client",
        generic: "Échec de la mise à jour des informations du client. Veuillez réessayer."
      },
      validation: {
        firstNameRequired: "Le prénom est requis",
        firstNameMaxLength: "Le prénom doit contenir 50 caractères ou moins",
        lastNameRequired: "Le nom de famille est requis",
        lastNameMaxLength: "Le nom de famille doit contenir 50 caractères ou moins",
        nationalIdRequired: "Le numéro d'identité nationale est requis",
        nationalIdMinLength: "Le numéro d'identité nationale doit contenir au moins 5 caractères",
        nationalIdMaxLength: "Le numéro d'identité nationale doit contenir 20 caractères ou moins",
        telephoneMinLength: "Le téléphone doit contenir au moins 10 chiffres",
        telephoneMaxLength: "Le téléphone doit contenir 15 chiffres ou moins",
        emailInvalid: "Veuillez entrer une adresse email valide",
        emailMaxLength: "L'email doit contenir 100 caractères ou moins"
      }
    }
  },
  caseFolder: {
    create: {
      title: "Créer un Nouveau Dossier",
      caseId: "ID du Dossier",
      createButton: "Créer le Dossier",
      creating: "Création en cours...",
      success: "Dossier créé avec succès",
      error: {
        duplicate: "Un dossier avec cet ID existe déjà",
        missingFields: "L'ID du dossier est requis"
      }
    }
  },
  fileUpload: {
    title: "Télécharger des Fichiers",
    selectFiles: "Sélectionner des Fichiers",
    dragDrop: "Glissez-déposez les fichiers ici",
    or: "ou",
    browse: "Parcourir",
    displayName: "Nom d'Affichage (optionnel)",
    uploadButton: "Télécharger",
    uploading: "Téléchargement {current} sur {total}...",
    progress: "{percent}%",
    success: "Fichier téléchargé avec succès",
    allSuccess: "Tous les fichiers téléchargés avec succès",
    someSuccess: "{count} sur {total} fichiers téléchargés avec succès",
    error: {
      size: "Le fichier dépasse la taille maximale de 10 Mo",
      filename: "Le nom du fichier contient des caractères invalides",
      generic: "Échec du téléchargement du fichier"
    }
  },
  fileDownload: {
    button: "Télécharger",
    downloading: "Téléchargement de {fileName}...",
    success: "Fichier téléchargé avec succès",
    error: "Échec du téléchargement du fichier"
  },
  fileDelete: {
    button: "Supprimer",
    confirm: "Êtes-vous sûr de vouloir supprimer ce fichier?",
    confirmTitle: "Supprimer le Fichier",
    confirmMessage: "Cette action ne peut pas être annulée. Le fichier sera définitivement supprimé.",
    deleting: "Suppression en cours...",
    success: "Fichier supprimé avec succès",
    error: "Échec de la suppression du fichier"
  },
  fileRename: {
    button: "Renommer",
    title: "Renommer le Fichier",
    newName: "Nouveau Nom",
    renameButton: "Renommer",
    renaming: "Renommage en cours...",
    success: "Fichier renommé avec succès",
    error: {
      invalidChars: "Le nom du fichier contient des caractères invalides",
      generic: "Échec du renommage du fichier"
    }
  },
  fileList: {
    loading: "Chargement...",
    empty: "Ce dossier est vide",
    filesLabel: "Fichiers",
    foldersLabel: "Dossiers",
    itemCount: "{count} élément(s)",
    lastModified: "Dernière modification",
    size: "Taille",
    name: "Nom",
    type: "Type"
  },
  folderDelete: {
    button: "Supprimer le Dossier",
    confirm: "Tapez SUPPRIMER pour confirmer",
    confirmTitle: "Supprimer le Dossier",
    confirmMessage: "Cela supprimera définitivement le dossier et tout son contenu. Cette action ne peut pas être annulée.",
    typeDelete: "Tapez SUPPRIMER pour confirmer:",
    invalidConfirmation: "Vous devez taper SUPPRIMER pour confirmer la suppression",
    deleting: "Suppression en cours...",
    success: "Dossier supprimé avec succès",
    error: "Échec de la suppression du dossier"
  },
  breadcrumb: {
    home: "Accueil",
    cases: "Dossiers"
  }
};
