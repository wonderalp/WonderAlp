/**
 * Application data
 *
 * Structure: 
 * {
 *     title:       App title
 *     intro:       App intro text
 *     more:        App "inpressum" text        -- html: h2, p
 *     sections[]:
 *     {
 *         title:   Section title
 *         intro:   Section intro title
 *         text:    Section intro text
 *         more:    Section "en savoir plus"    -- html: h2, p
 *         map:     Section [map_file, width, height]
 *         home:    Section picture on home screen
 *         menu:    Section picture in menu
 *         cells[]
 *         {
 *             title:       Cell title
 *             fav:         Cell favorite (and modal map) picture
 *             pin:         Pin position on map
 *             content[]
 *             {
 *                 x:, y:, w:, h:   Subcell position and size
 *                 a:,              Animate (fade-in)
 *                 full:            Background image taking full cell
 *                 ?thumb:          IMG element 
 *                 ?zoom:           Zoomed (big) picture
 *                 ?audio:          Audiofile
 *                 ?title:          Side text title
 *                 ?attrs:          Side text attributes [['attr name', 'attr value'], ...]
 *                 ?atext:          Side text for audio
 *             }
 *         }
 *     }
 * }
 */
DATA = {
    title:  "Les Alpes et\nla culture\nde la curiosité",
    intro:  "Dès la Renaissance, les territoires alpins furent parcourus par des citadins amateurs de randonnées et de beautés naturelles. Certains laissaient des graffiti en grec ou en latin sur les roches des sommets qu’ils avaient gravis. Ils racontaient leurs excursions dans des lettres écrites à leurs amis. Ils recueillaient des plantes, des animaux naturalisés, des fossiles, des cristaux, des instruments typiques. A l’écoute des savoirs paysans, des récits anciens, ils cherchaient à mettre en accord la culture locale et leurs connaissances livresques. Leur science était une science émerveillée, empreinte de tradition, d’imaginaire et d’observation. Ils conservaient leurs trouvailles, les faisaient voir ou les vendaient à de riches amateurs. Ainsi prirent naissance les «cabinets de curiosité», ces collections qui sont les ancêtres des musées d’histoire naturelle. Fervents partisans de la Réforme quelquefois, savants et érudits aussi, ces hommes participaient au mouvement européen de la <i>curiosité<\/i>, appelé à prendre un grand essor au XVIIème siècle.",
    more:   "<h1>WonderAlp</h1><div class=\"logo_viaticalpes\"></div><h2>Une science émerveillée<br>Les Alpes et la culture de la curiosité</h2><p>Recherche, textes, réalisation<br>Claude Reichler</p><p>Conseil scientifique, minéralogie et paléontologie<br>Nicolas Meisser</p><p>Traductions du latin<br>Marie Minger<br>Irina Tautschnig (Institut d’études néolatines de l’université d’Innsbruck)<br>Antoine Viredaz<br>avec nos remerciements à Olivier Thévenaz (Section des sciences de l’antiquité de l’université de Lausanne)</p><p>Les traductions ont été adaptées par Claude Reichler</p><p>Création sonore, audio<br>Laurent Nicolas</p><p>Lecture «voix des auteurs»<br>Piera Bellato<br>André Wyss</p><p>Documentation<br>base de données Viatimages (www.unil.ch/viatimages)<br>responsable Daniela Vaj</p><p>Programmation et UX/UI Design<br>Bread and Butter sa, Lausanne</p><p>Sources</p><p class=\"refs\">Altmann Johann Georg, <i>L’état et les délices de la Suisse</i>, Amsterdam, 1730<br>Andreae Johann Gerhard Reinhard, <i>Briefe aus der Schweiz nach Hannover geschrieben, in dem Jare 1763</i>, Zurich, 1776, 2<sup>e</sup> éd.<br>Gesner Conrad, <i>Historia animalium</i>, Tiguri (Zurich), 1551-1558, vol. I<br>Kircher Athanasius, <i>Mundus subterraneus</i>, Amstelodami (Amsterdam), 1678 (2<sup>e</sup> éd.)<br>Münster Sebastian, <i>De la Cosmographie universelle</i>, [traduit en français par François de Belleforest], Paris, 1575<br>Scheuchzer Johann Jakob, <i>Herbarium diluvianum</i>, Lugduni Batavorum (Leiden), 1723<br>Scheuchzer Johann Jakob, <i>Ouresiphoítes Helveticus, sive Itinera per helvetiae alpinas regiones</i>, Lugduni Batavorum, 1723<br>Wurm Ole, <i>Museum Wormianum seu historia rerum rariorum</i>, Lugduni Batavorum, 1655, fronstipice</p><p>Viaticalpes remercie les bibliothèques partenaires pour la mise à disposition des images</p><p>Bibliothèque cantonale et universitaire – Lausanne<br>Burgerbibliothek Bern / Bibliothèque de la bourgeoisie de Berne<br>Médiathèque Valais<br>Bibliothèque de Genève<br>Bibliothèque publique et universitaire de Neuchâtel<br>Bibliothèque nationale suisse, Berne<br>ainsi que<br>Université de Strasbourg, Service Commun de la Documentation<br>pour le frontispice du <i>Museum Wormianum</i></p><p>Indications bibliographiques</p><p class=\"refs\">(Nous limitons ces indications aux plus importants des ouvrages consultés)<br>Boscani Leoni Simona (Hrsg), <i>Wissenschaft – Berge – Ideologien. Johann Jakob Scheuchzer und die frühneuzeitliche Naturforschung</i>, Basel, Schwabe Verlag, 2010<br>Felfe Robert, <i>Naturgeschichte als kunstvolle Synthese. Physikotheologie und Bildpraxis bei Johann Jakob Scheuchzer</i>, Berlin, Akademie Verlag, 2003<br>Kempe Michael, <i>Wissenschaft, Theologie, Aufklärung. Johann Jakob Scheuchzer und die Sintfluttheorie</i>, Epfendorf, bibliotheca academica Verlag, 2003<br>Leu Urs B. (Hrsg), <i>Natura sacra. Der frühaufklärer Johann Jakob Scheuchzer</i>, Zug, Achius Verlag, 2012<br>Lugli Adalgisa, <i>Naturalia et mirabilia : il collezionismo enciclopedico nelle Wunderkammern d'Europa</i>, Milano, G. Mazzotta, 1983<br>Mauriès Patrick, <i>Cabinets de curiosités</i>, Paris, Gallimard, 2002<br>Rudwick Martin J.S., <i>The meaning of fossils : episodes in the history of palaeontology</i>, Chicago, University of Chicago Press, 1985</p><p>Voir aussi le livre augmenté associé à cette application :<br>Claude Reichler, <i>Les Alpes et leurs imagiers. Voyage et histoire du regard</i>, Lausanne, PPUR, coll. «Le savoir suisse», 2013<br>www.alpes-imagiers.ch</p><p>Nous avons eu recours à de nombreux sites internet ;<br>il est impossible de les mentionner tous</p><p>Nous remercions pour leur soutien :<br>Loterie romande<br>Sandoz Fondation de famille<br>Université de Lausanne <br>Association culturelle pour le voyage en Suisse</p><p>Nos remerciements pour leurs conseils et leur aide vont à<br>Laurent Bolli, Dominique Gold, Martin Korenjak, Daniela Vaj</p><div class=\"logos\"><div class=\"loterie\"></div><div class=\"unil\"></div><div class=\"acvs\"></div><div class=\"sandoz\"></div></div><p>Une production Viaticalpes<sup>®</sup><br>www.unil.ch/viaticalpes<br>Centre des sciences historiques de la culture (SHC)<br>Faculté des lettres / UNIL</p><p>© 2015 Tous droits de reproduction réservés<br>Claude Reichler<br>et<br>Université de Lausanne</p>",

    sections: []
}
