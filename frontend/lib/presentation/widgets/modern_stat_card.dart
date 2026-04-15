import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_colors.dart';

class ModernStatCard extends StatefulWidget {
  final String title;
  final int value;
  final IconData icon;
  final Color color;
  final String trend;
  final bool isLoading;

  const ModernStatCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    required this.trend,
    this.isLoading = false,
  });

  @override
  State<ModernStatCard> createState() => _ModernStatCardState();
}

class _ModernStatCardState extends State<ModernStatCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutBack));
    _controller.forward();
  }

  @override
  void didUpdateWidget(ModernStatCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
      _controller.reset();
      _controller.forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isLoading) {
      return _buildShimmer();
    }

    return ScaleTransition(
      scale: _scaleAnimation,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
          boxShadow: AppTheme.cardShadow,
          border: Border.all(color: AppColors.gray100),
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(AppTheme.sm),
                    decoration: BoxDecoration(
                      color: widget.color.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                    ),
                    child: Icon(widget.icon, color: widget.color, size: 20),
                  ),
                  const Spacer(),
                  _buildTrendBadge(),
                ],
              ),
              const SizedBox(height: AppTheme.md),
              TweenAnimationBuilder<int>(
                tween: IntTween(begin: 0, end: widget.value),
                duration: const Duration(milliseconds: 1500),
                builder: (context, value, child) {
                  return Text(
                    _formatNumber(value),
                    style: AppTheme.headline2.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w700,
                      fontSize: 28,
                    ),
                  );
                },
              ),
              const SizedBox(height: AppTheme.xs),
              Text(
                widget.title,
                style: AppTheme.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatNumber(int value) {
    if (value >= 1000000) {
      return '${(value / 1000000).toStringAsFixed(1)}M';
    } else if (value >= 1000) {
      return '${(value / 1000).toStringAsFixed(1)}K';
    }
    return value.toString();
  }

  Widget _buildTrendBadge() {
    final isPositive = widget.trend.startsWith('+');
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppTheme.sm,
        vertical: AppTheme.xs,
      ),
      decoration: BoxDecoration(
        color: isPositive ? AppColors.successLight : AppColors.errorLight,
        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isPositive ? Icons.trending_up : Icons.trending_down,
            size: 12,
            color: isPositive ? AppColors.success : AppColors.error,
          ),
          const SizedBox(width: 2),
          Text(
            widget.trend,
            style: AppTheme.caption.copyWith(
              color: isPositive ? AppColors.success : AppColors.error,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: AppColors.gray200,
      highlightColor: AppColors.gray100,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        ),
        padding: const EdgeInsets.all(AppTheme.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  ),
                ),
                const Spacer(),
                Container(
                  width: 50,
                  height: 24,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTheme.md),
            Container(width: 80, height: 32, color: Colors.white),
            const SizedBox(height: AppTheme.sm),
            Container(width: 100, height: 16, color: Colors.white),
          ],
        ),
      ),
    );
  }
}
