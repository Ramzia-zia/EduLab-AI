import 'dart:async';
import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

/// Roles. Le contrat v0.1 definit eleve, enseignant, etablissement, ministere.
/// Le role `admin` (maquette) est un AJOUT : voir le document des ajouts.
enum Role { admin, enseignant, etablissement, ministere }

extension InfoRole on Role {
  String get prefixe => name;

  String get libelle {
    switch (this) {
      case Role.admin:
        return 'Administrateur';
      case Role.enseignant:
        return 'Enseignant';
      case Role.etablissement:
        return 'Responsable d\'établissement';
      case Role.ministere:
        return 'Ministère';
    }
  }

  String get accueil {
    switch (this) {
      case Role.etablissement:
        return '/etablissement/mon_etablissement';
      default:
        return '/$name/tableau_de_bord';
    }
  }
}

class Session {
  const Session({
    required this.nom,
    required this.email,
    required this.role,
    required this.jeton,
    this.etablissementNom,
    this.etablissementActif,
  });
  final String nom;
  final String email;
  final Role role;
  final String jeton;
  final String? etablissementNom;
  final bool? etablissementActif;

  String get initiales {
    final mots = nom.split(' ').where((m) => m.isNotEmpty).toList();
    if (mots.isEmpty) return '?';
    if (mots.length == 1) {
      return mots.first
          .substring(0, mots.first.length < 2 ? 1 : 2)
          .toUpperCase();
    }
    return (mots[0][0] + mots[1][0]).toUpperCase();
  }
}

class SessionNotifier extends Notifier<Session?> {
  @override
  Session? build() => null;

  void connecter(Session session) => state = session;
  Future<void> deconnecter() async {
    await Supabase.instance.client.auth.signOut();
    state = null;
  }
}

final sessionProvider =
    NotifierProvider<SessionNotifier, Session?>(SessionNotifier.new);

final authentificationProvider =
    Provider<AuthentificationEdulab>((ref) => AuthentificationEdulab());

class AuthentificationEdulab {
  AuthentificationEdulab({http.Client? client})
      : _client = client ?? http.Client();

  final http.Client _client;

  Future<Session> connecter(String email, String motDePasse) async {
    final AuthResponse connexion;
    try {
      connexion = await Supabase.instance.client.auth.signInWithPassword(
        email: email,
        password: motDePasse,
      );
    } on AuthRetryableFetchException {
      throw const AuthentificationException('Supabase ne répond pas.');
    } on AuthException {
      throw const AuthentificationException(
          'E-mail ou mot de passe incorrect.');
    }

    final jeton = connexion.session?.accessToken;
    if (jeton == null) {
      throw const AuthentificationException('Aucune session Supabase reçue.');
    }

    if (_urlApi.trim().isEmpty) {
      await Supabase.instance.client.auth.signOut();
      throw const AuthentificationException('URL_API n’est pas configurée.');
    }

    try {
      final uri = Uri.parse('${_urlApi.replaceFirst(RegExp(r'/+$'), '')}/moi');
      final response = await _client.get(uri, headers: {
        'Authorization': 'Bearer $jeton'
      }).timeout(const Duration(seconds: 15));
      final body = jsonDecode(response.body);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        final message = body is Map<String, dynamic>
            ? body['message'] as String? ?? 'Profil non autorisé.'
            : 'Profil non autorisé.';
        throw AuthentificationException(message);
      }
      if (body is! Map<String, dynamic>) {
        throw const AuthentificationException('Réponse de profil invalide.');
      }
      final role = Role.values.where((r) => r.name == body['role']);
      if (role.isEmpty || role.single == Role.admin) {
        throw const AuthentificationException(
          'Ce rôle ne dispose pas encore d’un accès au back-office.',
        );
      }
      return Session(
        nom: body['nom'] as String,
        email: email,
        role: role.single,
        jeton: jeton,
        etablissementNom: body['etablissement_nom'] as String?,
        etablissementActif: body['etablissement_actif'] as bool?,
      );
    } on AuthentificationException {
      await Supabase.instance.client.auth.signOut();
      rethrow;
    } on http.ClientException {
      await Supabase.instance.client.auth.signOut();
      throw const AuthentificationException(
          'Impossible de joindre le serveur EduLab.');
    } on TimeoutException {
      await Supabase.instance.client.auth.signOut();
      throw const AuthentificationException(
          'Le serveur EduLab met trop de temps à répondre.');
    } on FormatException {
      await Supabase.instance.client.auth.signOut();
      throw const AuthentificationException(
          'Le serveur EduLab a renvoyé une réponse invalide.');
    }
  }

  Future<void> deconnecter() => Supabase.instance.client.auth.signOut();

  static const _urlApi = String.fromEnvironment('URL_API');
}

class AuthentificationException implements Exception {
  const AuthentificationException(this.message);
  final String message;

  @override
  String toString() => message;
}
