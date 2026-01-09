import Box, { BoxProps } from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SxProps, Theme, keyframes } from '@mui/material/styles';
import { cssVarRgba } from 'lib/utils';
import Image from 'components/base/Image';

interface PromoCardProps extends BoxProps {
  showFeatures?: boolean;
  img: string;
  imgStyles?: SxProps<Theme>;
  title?: string;
  subTitle?: string;
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const PromoCard = ({
  img,
  imgStyles,
  title = 'How to protect yourself from danger',
  sx,
  ...rest
}: PromoCardProps) => {
  return (
    <Box
      sx={{
        p: '2px',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '250%',
          height: '250%',
          pointerEvents: 'none',
          transform: 'rotate(180deg)',
          animation: `${spin} 6s linear infinite`,
          // ✅ 빨간색에서 연한 주황색(warning.light)으로 변경
          backgroundImage: ({ vars }) =>
            `conic-gradient(transparent 0%, ${cssVarRgba(vars.palette.warning.lightChannel, 1)} 25%, transparent 80%)`,
        },
      }}
    >
      <Box
        sx={({ vars }) => ({
          bgcolor: 'background.elevation1',
          p: 3,
          width: 1,
          borderRadius: 4,
          outline: 0,
          position: 'relative',
          overflow: 'hidden',
          ['&:after']: {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(
                120.77% 120.77% at 62.42% 14.25%,
                ${cssVarRgba(vars.palette.chGreen['50Channel'], 0)} 51.22%,
                ${cssVarRgba(vars.palette.chGreen['100Channel'], 0.48)} 69.8%
              ),
              radial-gradient(
                125.2% 221.14% at 103.41% -3.28%,
                ${cssVarRgba(vars.palette.background.elevation1Channel, 1)} 52.92%,
                ${cssVarRgba(vars.palette.chGreen['50Channel'], 0.48)} 67.23%,
                ${cssVarRgba(vars.palette.chGreen['100Channel'], 0.48)} 100%
              ),
              linear-gradient(
                309.91deg,
                ${cssVarRgba(vars.palette.chGreen['100Channel'], 0.02)} 0.61%,
                ${cssVarRgba(vars.palette.chGreen['200Channel'], 0.02)} 39.75%
              )
            `,
          },
          ...(sx as any),
        })}
        {...rest}
      >
        <Stack direction="column" gap={2} alignItems="center" position="relative" zIndex={10}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>

          {/* ✅ 이미지 가로 크기 확대 수정 */}
          <Box
            component="figure"
            sx={{
              m: 0,
              width: '120%', // 부모보다 20% 더 넓게 설정 (원하는 만큼 조절)
              maxWidth: 'none', // 최대 너비 제한 해제
              display: 'flex',
              justifyContent: 'center',
              ...imgStyles,
            }}
          >
            <Image
              alt=""
              src={img}
              sx={{
                width: '140%', // 가로로 꽉 채우기
                height: 'auto', // 비율 유지를 위해 auto 권장
                objectFit: 'cover', // 가로로 꽉 채울 때 이미지 왜곡 방지
              }}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default PromoCard;
