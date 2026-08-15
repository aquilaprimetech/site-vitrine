/* ==========================================================================
   AQUILA PRIME TECHNOLOGIES — MAIN.JS
   JavaScript vanilla, sans dépendance. Regroupe :
   1. Utilitaires (préférence de mouvement réduit)
   2. Header sticky (état scrollé)
   3. Méga-menu Services (souris + clavier)
   4. Menu mobile plein écran (piège de focus, Échap)
   5. Accordéon FAQ accessible
   6. Reveal au scroll (IntersectionObserver)
   7. Compteurs animés (une seule fois)
   8. Défilement doux des ancres
   9. Bouton retour en haut
   10. Formulaire de contact (validation côté client)
   11. Année courante dans le footer
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. UTILITAIRES
     ------------------------------------------------------------------ */

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /** Retourne la liste des éléments focusables visibles dans un conteneur. */
  function getFocusableElements(container) {
    var selector =
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])';
    return Array.prototype.slice.call(container.querySelectorAll(selector));
  }

  /* ------------------------------------------------------------------
     2. HEADER STICKY (ÉTAT SCROLLÉ)
     ------------------------------------------------------------------ */

  var header = document.querySelector('[data-header]');

  function updateHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 40) {
      header.classList.add('apt-header--scrolled');
    } else {
      header.classList.remove('apt-header--scrolled');
    }
  }

  if (header) {
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
  }

  /* ------------------------------------------------------------------
     3. MÉGA-MENU SERVICES (SOURIS + CLAVIER)
     ------------------------------------------------------------------ */

  var megaTrigger = document.querySelector('.apt-nav__trigger');
  var megaPanel = document.getElementById('mega-services');
  var megaItem = megaTrigger ? megaTrigger.closest('.apt-nav__item--has-mega') : null;

  function openMega() {
    if (!megaTrigger || !megaPanel) {
      return;
    }
    megaTrigger.setAttribute('aria-expanded', 'true');
    megaPanel.hidden = false;
  }

  function closeMega(returnFocus) {
    if (!megaTrigger || !megaPanel) {
      return;
    }
    megaTrigger.setAttribute('aria-expanded', 'false');
    megaPanel.hidden = true;
    if (returnFocus) {
      megaTrigger.focus();
    }
  }

  if (megaTrigger && megaPanel && megaItem) {
    // Clic/entrée clavier sur le déclencheur : bascule l'ouverture.
    megaTrigger.addEventListener('click', function () {
      var isOpen = megaTrigger.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMega(false);
      } else {
        openMega();
      }
    });

    // Survol souris : ouverture/fermeture (desktop uniquement, ≥ 1024px).
    megaItem.addEventListener('mouseenter', function () {
      if (window.innerWidth >= 1024) {
        openMega();
      }
    });

    megaItem.addEventListener('mouseleave', function () {
      if (window.innerWidth >= 1024) {
        closeMega(false);
      }
    });

    // Échap referme le méga-menu et rend le focus au déclencheur.
    megaItem.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMega(true);
      }
    });

    // Clic à l'extérieur : fermeture.
    document.addEventListener('click', function (event) {
      if (!megaItem.contains(event.target)) {
        closeMega(false);
      }
    });

    // Perte de focus hors du panneau : fermeture.
    document.addEventListener('focusin', function (event) {
      if (!megaItem.contains(event.target)) {
        closeMega(false);
      }
    });
  }

  /* ------------------------------------------------------------------
     4. MENU MOBILE PLEIN ÉCRAN (PIÈGE DE FOCUS, ÉCHAP)
     ------------------------------------------------------------------ */

  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.getElementById('mobile-menu');
  var menuClose = document.querySelector('[data-menu-close]');
  var body = document.body;
  var lastFocusedBeforeMenu = null;

  function openMobileMenu() {
    if (!mobileMenu || !menuToggle) {
      return;
    }
    lastFocusedBeforeMenu = document.activeElement;
    mobileMenu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    body.classList.add('apt-no-scroll');

    var focusable = getFocusableElements(mobileMenu);
    if (focusable.length) {
      focusable[0].focus();
    }
  }

  function closeMobileMenu() {
    if (!mobileMenu || !menuToggle) {
      return;
    }
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('apt-no-scroll');

    // Motif « disclosure » (WCAG 2.4.3) : le focus revient au bouton qui a
    // ouvert le panneau. On ne se fie pas à l'élément actif mémorisé à
    // l'ouverture : selon la façon dont le menu a été ouvert, il peut valoir
    // <body>, et body.focus() ne restitue rien à l'utilisateur clavier.
    var isVisible = function (el) {
      return el && el.offsetParent !== null;
    };

    if (isVisible(menuToggle)) {
      menuToggle.focus();
    } else if (isVisible(lastFocusedBeforeMenu)) {
      lastFocusedBeforeMenu.focus();
    }
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (menuClose) {
      menuClose.addEventListener('click', closeMobileMenu);
    }

    // Piège de focus + fermeture Échap.
    mobileMenu.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMobileMenu();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      var focusable = getFocusableElements(mobileMenu);
      if (!focusable.length) {
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // Sous-menu Services en accordéon simple sur mobile.
    var subTrigger = mobileMenu.querySelector('.apt-mobile-menu__sub-trigger');
    var subPanel = subTrigger
      ? document.getElementById(subTrigger.getAttribute('aria-controls'))
      : null;

    if (subTrigger && subPanel) {
      subTrigger.addEventListener('click', function () {
        var isOpen = subTrigger.getAttribute('aria-expanded') === 'true';
        subTrigger.setAttribute('aria-expanded', String(!isOpen));
        subPanel.hidden = isOpen;
      });
    }

    // Referme le menu si la fenêtre repasse en desktop (≥ 1024px).
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && !mobileMenu.hidden) {
        closeMobileMenu();
      }
    });
  }

  /* ------------------------------------------------------------------
     5. ACCORDÉON FAQ ACCESSIBLE
     ------------------------------------------------------------------ */

  var accordionTriggers = document.querySelectorAll('.apt-accordion__trigger');

  accordionTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Un seul panneau ouvert à la fois au sein du même accordéon.
      var accordion = trigger.closest('.apt-accordion');
      if (accordion) {
        accordion
          .querySelectorAll('.apt-accordion__trigger')
          .forEach(function (otherTrigger) {
            if (otherTrigger !== trigger) {
              otherTrigger.setAttribute('aria-expanded', 'false');
              var otherPanel = document.getElementById(
                otherTrigger.getAttribute('aria-controls')
              );
              if (otherPanel) {
                otherPanel.hidden = true;
              }
            }
          });
      }

      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (panel) {
        panel.hidden = isOpen;
      }
    });
  });

  /* ------------------------------------------------------------------
     6. REVEAL AU SCROLL (INTERSECTIONOBSERVER)
     ------------------------------------------------------------------ */

  var revealElements = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion) {
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else if ('IntersectionObserver' in window && revealElements.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach(function (el, index) {
      el.style.setProperty('--i', String(index % 8));
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ------------------------------------------------------------------
     7. COMPTEURS ANIMÉS (UNE SEULE FOIS)
     ------------------------------------------------------------------ */

  var counters = document.querySelectorAll('[data-counter]');

  function animateCounter(counterEl) {
    var target = parseInt(counterEl.getAttribute('data-count-to'), 10) || 0;
    var valueEl = counterEl.querySelector('[data-counter-target]');
    if (!valueEl) {
      return;
    }

    if (prefersReducedMotion) {
      valueEl.textContent = String(target);
      return;
    }

    // Le HTML porte la valeur finale en dur, pour rester juste sans
    // JavaScript. L'animation part donc de zéro explicitement.
    valueEl.textContent = '0';

    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (start === null) {
        start = timestamp;
      }
      var progress = Math.min((timestamp - start) / duration, 1);
      // Courbe ease-out approximative.
      var eased = 1 - Math.pow(1 - progress, 3);
      valueEl.textContent = String(Math.round(eased * target));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        valueEl.textContent = String(target);
      }
    }

    window.requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && counters.length) {
    var counterObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (counterEl) {
      counterObserver.observe(counterEl);
    });
  } else {
    counters.forEach(animateCounter);
  }

  /* ------------------------------------------------------------------
     8. DÉFILEMENT DOUX DES ANCRES
     ------------------------------------------------------------------ */

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) {
      return;
    }
    var targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') {
      return;
    }
    // Un href d'ancre n'est pas nécessairement un sélecteur CSS valide :
    // « #2024 » ou « #section:1 » font lever une SyntaxError à
    // querySelector, qui interromprait ce gestionnaire de clic — et donc
    // tous les défilements doux de la page. getElementById, lui, accepte
    // n'importe quel identifiant.
    var targetEl;
    try {
      targetEl = document.querySelector(targetId);
    } catch (e) {
      targetEl = document.getElementById(targetId.slice(1));
    }
    if (!targetEl) {
      return;
    }
    event.preventDefault();
    targetEl.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
    targetEl.setAttribute('tabindex', '-1');
    targetEl.focus({ preventScroll: true });
  });

  /* ------------------------------------------------------------------
     9. BOUTON RETOUR EN HAUT
     ------------------------------------------------------------------ */

  var backToTop = document.querySelector('[data-back-to-top]');

  if (backToTop) {
    backToTop.hidden = false;

    function updateBackToTop() {
      var visible = window.scrollY > 600;
      backToTop.classList.toggle('is-visible', visible);
      // Le bouton est invisible (opacity:0, pointer-events:none) tant qu'on
      // n'a pas défilé : il ne doit pas non plus être atteignable au clavier,
      // sinon le focus se pose sur un élément que personne ne voit.
      backToTop.tabIndex = visible ? 0 : -1;
    }

    updateBackToTop();
    window.addEventListener('scroll', updateBackToTop, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  /* ------------------------------------------------------------------
     10. FORMULAIRE DE CONTACT — VALIDATION CÔTÉ CLIENT
     ------------------------------------------------------------------

     Ce formulaire n'a pas de backend (action="#"). À la soumission, on
     valide les champs requis puis on affiche un message de confirmation
     simulé, sans envoi réel de données.

     POUR BRANCHER UN VRAI ENVOI, le client (ou son développeur) peut :
     a) mailto: remplacer l'action par
        "mailto:info@aquilaprimetech.com" avec method="POST" enctype
        "text/plain" (limité, dépend du client mail de l'utilisateur) ;
     b) Formspree (ou service équivalent) : créer un compte sur
        https://formspree.io, remplacer action="#" par l'URL de formulaire
        fournie (ex. "https://formspree.io/f/xxxxxxx"), et supprimer le
        event.preventDefault() de la validation ci-dessous une fois les
        champs valides, pour laisser le formulaire se soumettre normalement ;
     c) Script PHP maison : héberger un script (ex. "envoi-contact.php")
        sur le même serveur, remplacer action="#" par son chemin, et
        adapter la logique ci-dessous pour envoyer les données via
        fetch() en AJAX plutôt que d'afficher directement le message de
        confirmation simulé.
     ------------------------------------------------------------------ */

  var contactForm = document.querySelector('.apt-form[data-contact-form]');

  if (contactForm) {
    var successBlock = contactForm.querySelector('.apt-form__success');
    var errorSummary = contactForm.querySelector('.apt-form__error-summary');

    var validators = {
      nom: function (value) {
        return value.trim().length > 0;
      },
      email: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      },
      message: function (value) {
        return value.trim().length > 0;
      }
    };

    var messages = {
      nom: 'Merci d’indiquer votre nom.',
      email: 'Merci de renseigner une adresse email valide.',
      message: 'Merci de décrire votre besoin en quelques mots.'
    };

    function setFieldError(field, hasError) {
      var errorId = field.id + '-error';
      var errorEl = document.getElementById(errorId);

      if (hasError) {
        field.setAttribute('aria-invalid', 'true');
        if (errorEl) {
          errorEl.hidden = false;
        }
      } else {
        field.removeAttribute('aria-invalid');
        if (errorEl) {
          errorEl.hidden = true;
        }
      }
    }

    function validateForm() {
      var isValid = true;

      Object.keys(validators).forEach(function (name) {
        var field = contactForm.elements.namedItem(name);
        if (!field) {
          return;
        }
        var fieldIsValid = validators[name](field.value || '');
        setFieldError(field, !fieldIsValid);
        if (!fieldIsValid) {
          isValid = false;
        }
      });

      return isValid;
    }

    // Validation au blur pour un retour immédiat, sans attendre l'envoi.
    Object.keys(validators).forEach(function (name) {
      var field = contactForm.elements.namedItem(name);
      if (!field) {
        return;
      }
      field.addEventListener('blur', function () {
        setFieldError(field, !validators[name](field.value || ''));
      });
    });

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (successBlock) {
        successBlock.hidden = true;
      }
      if (errorSummary) {
        errorSummary.hidden = true;
      }

      var isValid = validateForm();

      if (!isValid) {
        if (errorSummary) {
          errorSummary.hidden = false;
          errorSummary.focus();
        }
        var firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      // Envoi réel par la messagerie du visiteur.
      //
      // Le site n'a pas de traitement côté serveur. Plutôt que de laisser le
      // navigateur soumettre le formulaire vers l'action mailto: — ce qui
      // produit un corps de message brut du type « nom=Jean\nemail=… » et un
      // objet vide —, on compose ici un courriel lisible par un humain.
      //
      // La soumission native reste le filet de sécurité : si ce script
      // n'était pas chargé, le formulaire partirait quand même vers la bonne
      // adresse, en POST (voir le commentaire dans contact.html).
      var valeur = function (nom) {
        var champ = contactForm.elements.namedItem(nom);
        return champ && champ.value ? String(champ.value).trim() : '';
      };

      var serviceChamp = contactForm.elements.namedItem('service');
      var serviceLibelle = '';
      if (serviceChamp && serviceChamp.selectedIndex > 0) {
        serviceLibelle = serviceChamp.options[serviceChamp.selectedIndex].text;
      }

      var objet = serviceLibelle
        ? 'Demande — ' + serviceLibelle
        : 'Demande depuis le site';

      var lignes = [
        'Nom : ' + valeur('nom'),
        'Entreprise : ' + (valeur('entreprise') || '(non renseignée)'),
        'Email : ' + valeur('email'),
        'Téléphone : ' + (valeur('telephone') || '(non renseigné)'),
        'Service concerné : ' + (serviceLibelle || '(non précisé)'),
        '',
        valeur('message')
      ];

      // encodeURIComponent sur chaque partie : un message contenant &, # ou
      // un retour à la ligne tronquerait sinon le courriel au premier
      // caractère réservé.
      var lien = contactForm.getAttribute('action') +
        '?subject=' + encodeURIComponent(objet) +
        '&body=' + encodeURIComponent(lignes.join('\n'));

      // On affiche la confirmation AVANT d'ouvrir la messagerie : sur les
      // postes sans client de messagerie configuré, rien ne se passe à
      // l'ouverture, et le visiteur doit malgré tout voir l'adresse de repli
      // proposée dans ce bloc.
      if (successBlock) {
        successBlock.hidden = false;
        successBlock.focus();
      }

      window.location.href = lien;

      // Le formulaire n'est PAS réinitialisé : tant que le visiteur n'a pas
      // appuyé sur « Envoyer » dans sa messagerie, sa saisie doit rester
      // disponible — pour la recopier si l'ouverture a échoué.
    });
  }

  /* ------------------------------------------------------------------
     11. ANNÉE COURANTE DANS LE FOOTER
     ------------------------------------------------------------------ */

  var yearEls = document.querySelectorAll('[data-current-year]');
  yearEls.forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ------------------------------------------------------------------
     12. LOGOS PARTENAIRES & CERTIFICATIONS (amélioration progressive)

     Aucun logo de marque tierce n'est livré avec le site : ces fichiers
     appartiennent à leurs titulaires et doivent être fournis par le client
     (voir assets/img/partners/LISEZ-MOI.txt).

     Chaque tuile porte data-logo="<slug>" et data-logo-dir="<dossier>".
     On tente de charger assets/img/<dossier>/<slug>.svg puis .png ; si le
     fichier existe, il remplace le libellé typographique. S'il n'existe pas,
     la tuile garde son rendu actuel — aucune image cassée, aucune erreur.
     ------------------------------------------------------------------ */

  var logoTiles = document.querySelectorAll('[data-logo][data-logo-dir]');

  if (logoTiles.length) {
    // Le site vit à la racine ou dans /services/ : on déduit le préfixe
    // relatif de la feuille de styles déjà résolue par le navigateur.
    var cssLink = document.querySelector('link[href$="tokens.css"]');
    var base = cssLink
      ? cssLink.getAttribute('href').replace(/css\/tokens\.css$/, '')
      : 'assets/';

    // Un manifeste par dossier (logos.json) déclare les fichiers réellement
    // présents. On le lit une seule fois : pas de détection à l'aveugle, donc
    // aucune requête 404 en console quand un logo n'a pas été fourni.
    var dirs = {};
    logoTiles.forEach(function (tile) {
      dirs[tile.getAttribute('data-logo-dir')] = true;
    });

    var injectInto = function (dir, available) {
      logoTiles.forEach(function (tile) {
        if (tile.getAttribute('data-logo-dir') !== dir) return;

        // Les logos partenaires sont désormais écrits en dur dans le HTML :
        // ils s'affichent ainsi même sans JavaScript et même quand la page
        // est ouverte en file://, où fetch() est bloqué. Ce garde-fou évite
        // d'en injecter un second par-dessus.
        if (tile.querySelector('.apt-wordmark__logo, .apt-badge__logo')) return;

        var name = tile.getAttribute('data-logo');
        var file = available[name];
        // logos.json s'édite à la main : on n'accepte qu'un nom de fichier
        // simple, sans séparateur de chemin. Une valeur telle que
        // « ../../autre-chose » ou « //hote.tld/x.svg » construirait sinon
        // une URL hors du dossier attendu. La CSP img-src 'self' bloquerait
        // le cas externe, mais mieux vaut ne pas dépendre d'un seul rempart.
        if (!file || !/^[A-Za-z0-9._-]+\.(?:svg|png|webp)$/.test(String(file))) return;

        var img = document.createElement('img');
        img.src = base + 'img/' + dir + '/' + file;
        img.alt = '';               // le nom de la marque reste dans la tuile
        img.loading = 'lazy';
        img.className = tile.classList.contains('apt-badge')
          ? 'apt-badge__logo'
          : 'apt-wordmark__logo';

        var ring = tile.querySelector('.apt-badge__ring');
        if (ring) {
          tile.replaceChild(img, ring);
        } else {
          tile.insertBefore(img, tile.firstChild);
        }
      });
    };

    Object.keys(dirs).forEach(function (dir) {
      if (!window.fetch) return;

      window.fetch(base + 'img/' + dir + '/logos.json', { cache: 'no-cache' })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (list) {
          if (!list) return;

          // Accepte ["dell.svg", …] ou {"dell": "dell.svg", …}
          var available = {};
          if (Array.isArray(list)) {
            list.forEach(function (f) {
              available[String(f).replace(/\.[^.]+$/, '')] = f;
            });
          } else if (typeof list === 'object') {
            available = list;
          }

          injectInto(dir, available);
        })
        .catch(function () { /* manifeste absent ou illisible : on garde le rendu typographique */ });
    });
  }
})();
