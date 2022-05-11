5009
%{
#include "EntitiesMP/StdH/StdH.h"
%}

enum FireworkType {
	0 FT_FIREWORK00	"",
  1 FT_FIREWORK01	"",
	2 FT_FIREWORK02	"",
	3 FT_FIREWORK03	"",
	4 FT_FIREWORK04	"",
	5 FT_FIREWORK05	"",
	6 FT_FIREWORK06	"",
	7 FT_FIREWORK07	"",
	8 FT_FIREWORK08	"",
	9 FT_FIREWORK09	"",
};

event ESpawnFirework {
	FLOAT tmStart,
	FLOAT fSize,
	COLOR col,
};

class CFirework: CMovableModelEntity {
name      "Firework";
thumbnail "";

properties:

	1 enum  FireworkType m_ftType = FT_FIREWORK00,
	2 FLOAT m_tmStart = 0.0f,
	3 FLOAT m_fSize = 1.0f,
	4 COLOR m_colColor = C_WHITE,

components:

  1 model   MODEL_RAIL          "Models\\RailGun\\Projectile\\Ray.mdl",
  2 texture TEXTURE_RAIL        "Models\\RailGun\\Projectile\\Ray.tex",

functions:

	void RenderParticles(void)
	{
		switch(m_ftType)
		{
		case FT_FIREWORK00:
			Particles_Firework00(this, m_tmStart, m_fSize, m_colColor);
			break;
		case FT_FIREWORK01:
			Particles_Firework01(this, m_tmStart, m_fSize, m_colColor);
			break;
		case FT_FIREWORK02:
			Particles_Firework02(this, m_tmStart, m_fSize, m_colColor);
			break;
		case FT_FIREWORK03:
			Particles_Firework03(this, m_tmStart, m_fSize, m_colColor);
			break;
		case FT_FIREWORK04:
			Particles_Firework04(this, m_tmStart, m_fSize, m_colColor);
			break;
		case FT_FIREWORK05:
			Particles_Firework05(this, m_tmStart, m_fSize, m_colColor);
			break;
		case FT_FIREWORK06:
			Particles_Firework06(this, m_tmStart, m_fSize, m_colColor);
			break;
		case FT_FIREWORK07:
			Particles_Firework07(this, m_tmStart, m_fSize, m_colColor);
			break;
		case FT_FIREWORK08:
			Particles_Firework08(this, m_tmStart, m_fSize, m_colColor);
			break;
		case FT_FIREWORK09:
			Particles_Firework09(this, m_tmStart, m_fSize, m_colColor);
			break;
		default:
			{
			}
		}
	}

FLOAT3D GetGravity(CEntity *pen)
{
  return ((CMovableEntity *)pen)->en_vGravityDir*
         ((CMovableEntity *)pen)->en_fGravityA;
}

procedures:

	Main(ESpawnFirework eSpawn)
	{
		//CPrintF("Firework Main\n");
		m_tmStart = _pTimer->CurrentTick();//eSpawn.tmStart;
		m_fSize = eSpawn.fSize;
		m_colColor = eSpawn.col;

		//InitAsEditorModel();
		InitAsModel();
    SetPhysicsFlags(EPF_MODEL_BOUNCING);
    SetCollisionFlags(ECF_DEBRIS);
    SetModel(MODEL_RAIL);
		SetModelMainTexture(TEXTURE_RAIL);

		//en_fGravityA = 30.0f;
		//en_vGravityDir = FLOAT3D(0, 1, 0);
		en_fDensity = 500.0f;

		wait(3.0f)
		{
			on (EBegin) : { resume; }
			on (ETimer) : { stop; }
		}

		Destroy();
		return;
	}
};
