import { useState } from 'react';
import { View, Text, TouchableOpacity, Clipboard, Alert, Share } from 'react-native';
import { Gift, Copy, QrCode, Share2 } from 'lucide-react-native';
import { QRCodeModal } from './qr-code-modal';

interface CompactInviteBannerProps {
  referralCode?: string;
}

export function CompactInviteBanner({ referralCode }: CompactInviteBannerProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const inviteUrl = referralCode ? `https://ordenv.org/join?ref=${referralCode}` : '';

  const copyToClipboard = () => {
    if (inviteUrl) {
      Clipboard.setString(inviteUrl);
      Alert.alert('Скопійовано!', 'Посилання для запрошення скопійовано в буфер обміну');
    }
  };

  const shareInvite = async () => {
    if (inviteUrl) {
      try {
        await Share.share({
          message: `Приєднуйтесь до Ордену Ветеранів! ${inviteUrl}`,
          url: inviteUrl,
          title: 'Запрошення до Ордену Ветеранів',
        });
      } catch (error) {
        // User cancelled share
      }
    }
  };

  const showQRModalHandler = () => {
    setShowQRModal(true);
  };

  const hideQRModal = () => {
    setShowQRModal(false);
  };

  if (!referralCode) return null;

  return (
    <>
      <View className="bg-panel-900 border border-panel-850 rounded-xl p-4 flex-row items-center">
        {/* Icon */}
        <View className="w-10 h-10 rounded-lg bg-bronze/20 items-center justify-center mr-3">
          <Gift color="#b5793a" size={20} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="text-text-100 font-inter-bold text-sm">Запросити друга</Text>
          <Text className="text-muted-500 text-xs font-mono">{referralCode}</Text>
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={copyToClipboard}
            className="w-10 h-10 rounded-lg bg-panel-850 items-center justify-center"
            activeOpacity={1}
          >
            <Copy color="#8b8f96" size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={showQRModalHandler}
            className="w-10 h-10 rounded-lg bg-panel-850 items-center justify-center"
            activeOpacity={1}
          >
            <QrCode color="#8b8f96" size={18} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={shareInvite}
            className="h-10 px-4 rounded-lg bg-bronze items-center justify-center"
            activeOpacity={1}
          >
            <Share2 color="#fff" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* QR Code Modal */}
      <QRCodeModal
        visible={showQRModal}
        value={inviteUrl}
        onClose={hideQRModal}
        onShare={shareInvite}
        title="Запросити друга"
        subtitle={`Код: ${referralCode}`}
      />
    </>
  );
}
