import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../routes/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_colors.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'Super User',
          style: AppTheme.headline3.copyWith(
            color: AppColors.textOnPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppTheme.lg),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _ProfileCard(
                userName: user?.name ?? 'Global Super User',
                userRole: user?.role.toUpperCase() ?? 'SUPER USER',
              ),
              const SizedBox(height: AppTheme.xl),
              _LogoutButton(
                onPressed: () => authProvider.logout().then((_) {
                  Navigator.of(
                    context,
                  ).pushNamedAndRemoveUntil(AppRouter.login, (route) => false);
                }),
              ),
              const SizedBox(height: AppTheme.xxl),
              Text(
                'MediTrack Pro v1.0.0',
                style: AppTheme.bodySmall.copyWith(
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  final String userName;
  final String userRole;

  const _ProfileCard({required this.userName, required this.userRole});

  Color _getRoleColor(String role) {
    switch (role.toUpperCase()) {
      case 'SUPER USER':
        return AppColors.primary;
      case 'ADMIN':
        return AppColors.success;
      case 'PATIENT':
        return AppColors.info;
      default:
        return AppColors.gray500;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(maxWidth: 400),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow.withValues(alpha: 0.08),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.primary.withValues(alpha: 0.1),
                    AppColors.primary.withValues(alpha: 0.05),
                  ],
                ),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.2),
                  width: 2,
                ),
              ),
              child: Icon(
                Icons.admin_panel_settings_rounded,
                size: 48,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: AppTheme.lg),
            Text(
              userName,
              style: AppTheme.headline3.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w700,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppTheme.md),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppTheme.lg,
                vertical: AppTheme.sm,
              ),
              decoration: BoxDecoration(
                color: _getRoleColor(userRole).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.verified_rounded,
                    size: 18,
                    color: _getRoleColor(userRole),
                  ),
                  const SizedBox(width: AppTheme.xs),
                  Text(
                    userRole,
                    style: AppTheme.bodyMedium.copyWith(
                      color: _getRoleColor(userRole),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LogoutButton extends StatelessWidget {
  final VoidCallback onPressed;

  const _LogoutButton({required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 400),
      child: ElevatedButton.icon(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.error,
          foregroundColor: AppColors.textOnPrimary,
          padding: const EdgeInsets.symmetric(
            vertical: AppTheme.md,
            horizontal: AppTheme.xl,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
          ),
          elevation: 0,
        ),
        icon: const Icon(Icons.logout_rounded),
        label: Text(
          'Sign Out',
          style: AppTheme.button.copyWith(
            color: AppColors.textOnPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
