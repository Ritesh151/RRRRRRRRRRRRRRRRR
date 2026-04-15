import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../data/models/user_model.dart';
import '../data/repositories/auth_repository.dart';
import '../services/preference_service.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _repository = AuthRepository();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  UserModel? _user;
  bool _isLoading = false;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;

  AuthProvider() {
    _setupUnauthorizedHandler();
  }

  void _setupUnauthorizedHandler() {
    ApiService.instance.setUnauthorizedCallback(() {
      debugPrint('AuthProvider: Received 401 - logging out');
      logout();
    });
  }

  Future<bool> tryAutoLogin() async {
    final token = kIsWeb
        ? PreferenceService.getAuthToken()
        : await _storage.read(key: 'token');
    if (token == null) return false;

    try {
      _user = await _repository.getMe();
      if (_user != null) {
        SocketService.instance.connect();
      }
      notifyListeners();
      return true;
    } catch (e) {
      await logout();
      return false;
    }
  }

  Future<void> login(String email, String password) async {
    _setLoading(true);
    try {
      _user = await _repository.login(email, password);
      if (_user?.token != null) {
        if (kIsWeb) {
          await PreferenceService.setAuthToken(_user!.token!);
        } else {
          await _storage.write(key: 'token', value: _user!.token);
        }
        SocketService.instance.connect();
      }
      notifyListeners();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> register(
    String name,
    String email,
    String password,
    String hospitalId,
  ) async {
    _setLoading(true);
    try {
      _user = await _repository.register(name, email, password, hospitalId);
      if (_user?.token != null) {
        if (kIsWeb) {
          await PreferenceService.setAuthToken(_user!.token!);
        } else {
          await _storage.write(key: 'token', value: _user!.token);
        }
        SocketService.instance.connect();
      }
      notifyListeners();
    } catch (e) {
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    if (kIsWeb) {
      await PreferenceService.clearAuthToken();
    } else {
      await _storage.delete(key: 'token');
    }
    _user = null;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
