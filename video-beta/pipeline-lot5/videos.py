"""Scripts des 5 vidéos du lot. Une entrée = une phrase de la prise de voix, dans l'ordre.
cap : texte affiché, "affiché|lu" pour le timing (« _ » = espace lu), « * » = vert, « ^ » = rouge, « ¶ » = retour à la ligne.
seg : bloc de texte affiché. add : silence ajouté après la phrase (secondes)."""

NB = " "
CTA = [
    dict(seg="c1", cap="Réservez votre *one-to-one de 30" + NB + "minutes,|trente_minutes, en visio."),
    dict(seg="c2", cap="On identifie ensemble où votre agence perd des affaires."),
    dict(seg="c3", cap="Le lien est dans la *bio."),
]

VIDEOS = {
    "v1": dict(
        name="mova-ia-lot-v1-vendeur-sans-nouvelles",
        chunks=[
            dict(seg="h1", cap="Dix-neuf jours ^sans ^nouvelles."),
            dict(seg="h2", cap="Trois visites ont eu lieu. ^Aucun ^compte ^rendu n'est parti."),
            dict(seg="h3", cap="Votre vendeuse s'inquiète. Et un ^concurrent vient de l'appeler."),
            dict(seg="h4", cap="Sans nouvelles, votre mandat est en ^danger."),
            dict(seg="b1", add=.9, cap="Il existe une *meilleure *façon."),
            dict(seg="s1", cap="*mova.ia|Mova_I.A. installe un agent IA|I.A. sur *mesure dans votre agence."),
            dict(seg="s2", cap="Après chaque visite, il prépare le *compte *rendu."),
            dict(seg="s3", cap="Vous relisez. Vous *validez."),
            dict(seg="s4", cap="Il l'envoie au vendeur, et programme le *prochain *point."),
            dict(seg="r", cap="Un vendeur informé est un vendeur *rassuré."),
        ] + CTA,
        tts="Dix-neuf jours sans nouvelles. Trois visites ont eu lieu. Aucun compte rendu n'est parti. Votre vendeuse s'inquiète. Et un concurrent vient de l'appeler. Sans nouvelles, votre mandat est en danger. Il existe une meilleure façon. Mova I.A. installe un agent I.A. sur mesure dans votre agence. Après chaque visite, il prépare le compte rendu. Vous relisez. Vous validez. Il l'envoie au vendeur, et programme le prochain point. Un vendeur informé est un vendeur rassuré. Réservez votre one-to-one de trente minutes, en visio. On identifie ensemble où votre agence perd des affaires. Le lien est dans la bio.",
    ),
    "v2": dict(
        name="mova-ia-lot-v2-fichier-acquereurs",
        chunks=[
            dict(seg="h1", cap="Le *bien *idéal vient d'entrer en mandat."),
            dict(seg="h2", cap="Les acheteurs qui le cherchaient ? ^Personne ne les a relancés depuis ^des ^mois."),
            dict(seg="h3", cap="Certains ont acheté ailleurs. D'autres ont changé de projet. Votre fichier ^l'ignore."),
            dict(seg="h4", cap="Et pour le remettre à jour, il faut tout ^ressaisir. ^Deux ^fois."),
            dict(seg="b1", add=.9, cap="Il existe une *meilleure *façon."),
            dict(seg="s1", cap="*mova.ia|Mova_I.A. conçoit un agent IA|I.A. sur *mesure pour votre agence."),
            dict(seg="s2", cap="Il *relance vos acquéreurs et met leur projet à jour dans votre CRM. *Sans *double *saisie."),
            dict(seg="s3", cap="Un nouveau bien arrive ? Il vous propose les bons acheteurs. Vous *validez, il les prévient."),
            dict(seg="r", cap="Votre fichier reste *vivant. Et le *bon *acheteur reçoit le bon bien."),
        ] + CTA,
        tts="Le bien idéal vient d'entrer en mandat. Les acheteurs qui le cherchaient ? Personne ne les a relancés depuis des mois. Certains ont acheté ailleurs. D'autres ont changé de projet. Votre fichier l'ignore. Et pour le remettre à jour, il faut tout ressaisir. Deux fois. Il existe une meilleure façon. Mova I.A. conçoit un agent I.A. sur mesure pour votre agence. Il relance vos acquéreurs et met leur projet à jour dans votre CRM. Sans double saisie. Un nouveau bien arrive ? Il vous propose les bons acheteurs. Vous validez, il les prévient. Votre fichier reste vivant. Et le bon acheteur reçoit le bon bien. Réservez votre one-to-one de trente minutes, en visio. On identifie ensemble où votre agence perd des affaires. Le lien est dans la bio.",
    ),
    "v3": dict(
        name="mova-ia-lot-v3-remplacer-negociateurs",
        chunks=[
            dict(seg="h1", cap="Une IA|I.A. va-t-elle remplacer vos négociateurs ?"),
            dict(seg="h2", add=.25, cap="*Non."),
            dict(seg="h3", cap="Elle prend ce qui les éloigne du *terrain."),
            dict(seg="l1", cap="Répondre à une demande à 22" + NB + "h.|vingt-deux_heures. Relancer. Saisir dans le CRM. Envoyer les comptes rendus."),
            dict(seg="l2", cap="Vos négociateurs gardent ce qui fait vendre : la *relation, la *visite, la *négociation, la *décision."),
            dict(seg="v1", cap="L'agent prépare. Vous validez. *Vous *gardez *la *main."),
            dict(seg="v2", cap="Et face à vos clients, il se présente comme une *IA.|I.A."),
            dict(seg="st", cap="En France, *40" + NB + "%|quarante_pour_cent des TPE et PME utilisent déjà une solution d'IA.|I.A. Contre 26" + NB + "%|vingt-six_pour_cent un an plus tôt."),
            dict(seg="s1", cap="*mova.ia|Mova_I.A. conçoit ces agents sur *mesure pour votre agence."),
        ] + CTA,
        tts="Une I.A. va-t-elle remplacer vos négociateurs ? Non. Elle prend ce qui les éloigne du terrain. Répondre à une demande à vingt-deux heures. Relancer. Saisir dans le CRM. Envoyer les comptes rendus. Vos négociateurs gardent ce qui fait vendre : la relation, la visite, la négociation, la décision. L'agent prépare. Vous validez. Vous gardez la main. Et face à vos clients, il se présente comme une I.A. En France, quarante pour cent des TPE et PME utilisent déjà une solution d'I.A. Contre vingt-six pour cent un an plus tôt. Mova I.A. conçoit ces agents sur mesure pour votre agence. Réservez votre one-to-one de trente minutes, en visio. On identifie ensemble où votre agence perd des affaires. Le lien est dans la bio.",
    ),
    "v4": dict(
        name="mova-ia-lot-v4-methode-5-etapes",
        chunks=[
            dict(seg="h1", cap="Mettre de l'IA|I.A. dans votre agence. Par où commencer ?"),
            dict(seg="h2", cap="Un outil de plus, installé puis ^abandonné au bout d'un mois ? Vous en avez sans doute déjà vu."),
            dict(seg="b1", cap="Avec *mova.ia,|Mova_I.A., tout se fait en *cinq *étapes."),
            dict(seg="p1", cap="1.|Un. Un *one-to-one de 30" + NB + "minutes,|trente_minutes, en visio : on repère où votre agence perd des affaires."),
            dict(seg="p2", cap="2.|Deux. *L'audit de vos outils actuels."),
            dict(seg="p3", cap="3.|Trois. Vos agents, conçus *sur *mesure."),
            dict(seg="p4", cap="4.|Quatre. *Test, puis *mise *en *service."),
            dict(seg="p5", cap="5.|Cinq. Un *suivi chaque mois, sans engagement."),
            dict(seg="r", cap="Un *seul *interlocuteur, du premier échange au suivi."),
            dict(seg="c1", cap="Réservez votre *one-to-one de 30" + NB + "minutes,|trente_minutes, en visio."),
            dict(seg="c3", cap="Le lien est dans la *bio."),
        ],
        tts="Mettre de l'I.A. dans votre agence. Par où commencer ? Un outil de plus, installé puis abandonné au bout d'un mois ? Vous en avez sans doute déjà vu. Avec Mova I.A., tout se fait en cinq étapes. Un. Un one-to-one de trente minutes, en visio : on repère où votre agence perd des affaires. Deux. L'audit de vos outils actuels. Trois. Vos agents, conçus sur mesure. Quatre. Test, puis mise en service. Cinq. Un suivi chaque mois, sans engagement. Un seul interlocuteur, du premier échange au suivi. Réservez votre one-to-one de trente minutes, en visio. Le lien est dans la bio.",
    ),
    "v5": dict(
        name="mova-ia-lot-v5-samedi-21h47",
        chunks=[
            dict(seg="h1", cap="Samedi, 21" + NB + "h" + NB + "47.|vingt_et_une_heures_quarante-sept."),
            dict(seg="h2", cap="Un acheteur vous écrit."),
            dict(seg="h3", cap="Lundi, vous le rappelez."),
            dict(seg="h4", cap="Il a déjà ^visité ^ailleurs."),
            dict(seg="h6", add=.2, cap="Sur 2" + NB + "198|plus_de_deux_mille demandes envoyées à des agences, ^68" + NB + "%|soixante-huit_pour_cent sont restées ^sans ^réponse en 24" + NB + "h.|vingt-quatre_heures."),
            dict(seg="s1", cap="Avec *mova.ia,|Mova_I.A., l'agent *répond aussitôt, *qualifie le projet, et *propose une visite."),
            dict(seg="s2", cap="Vous *validez. C'est tout."),
            dict(seg="c1", cap="Réservez votre *one-to-one de 30" + NB + "minutes,|trente_minutes, en visio."),
            dict(seg="c3", cap="Lien en *bio."),
        ],
        tts="Samedi, vingt et une heures quarante-sept. Un acheteur vous écrit. Lundi, vous le rappelez. Il a déjà visité ailleurs. Sur plus de deux mille demandes envoyées à des agences, soixante-huit pour cent sont restées sans réponse en vingt-quatre heures. Avec Mova I.A., l'agent répond aussitôt, qualifie le projet, et propose une visite. Vous validez. C'est tout. Réservez votre one-to-one de trente minutes, en visio. Lien en bio.",
    ),
}
