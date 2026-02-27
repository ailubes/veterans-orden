import { View, Text, TouchableOpacity, Modal, Share } from 'react-native';
import { X, Share2 } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeModalProps {
  visible: boolean;
  value: string;
  onClose: () => void;
  onShare?: () => void;
  title?: string;
  subtitle?: string;
}

export function QRCodeModal({
  visible,
  value,
  onClose,
  onShare,
  title = 'Код запрошення',
  subtitle = 'Відскануйте QR-код для приєднання',
}: QRCodeModalProps) {
  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    try {
      await Share.share({
        message: `Приєднуйтесь до Ордену Ветеранів! ${value}`,
        url: value,
        title: 'Запрошення до Ордену Ветеранів',
      });
    } catch (error) {
      // User cancelled share
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-bg-950/95 justify-center items-center px-6">
        <View className="bg-panel-900 border border-panel-850 rounded-2xl p-6 w-full max-w-sm">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-text-100 font-inter-bold text-lg">{title}</Text>
              <Text className="text-muted-500 text-xs font-inter mt-0.5">{subtitle}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-panel-850 items-center justify-center"
              activeOpacity={1}
            >
              <X color="#8b8f96" size={20} />
            </TouchableOpacity>
          </View>

          {/* QR Code */}
          <View className="items-center mb-6">
            <View className="bg-white rounded-2xl p-6">
              <QRCode value={value} size={200} />
            </View>
          </View>

          {/* URL Display */}
          <View className="bg-bg-950 rounded-xl px-4 py-3 mb-4">
            <Text className="text-muted-500 text-xs font-mono mb-1">Посилання</Text>
            <Text
              className="text-text-100 font-inter text-sm"
              numberOfLines={2}
              ellipsizeMode="middle"
            >
              {value}
            </Text>
          </View>

          {/* Share Button */}
          <TouchableOpacity
            onPress={handleShare}
            className="bg-bronze rounded-xl py-3.5 px-4 flex-row items-center justify-center"
            activeOpacity={1}
          >
            <Share2 color="#fff" size={18} />
            <Text className="text-white font-inter-bold text-sm ml-2">Поділитися</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
