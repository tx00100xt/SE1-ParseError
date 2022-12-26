5018
%{
#include "EntitiesMP/StdH/StdH.h"
%}

event ELaunchTracer {
  CEntityPointer penLauncher,     // who launched it
};

%{
void CTracer_OnPrecache(CDLLEntityClass *pdec, INDEX iUser) 
{
  pdec->PrecacheModel(MODEL_TRACER);
  pdec->PrecacheTexture(TEXTURE_TRACER);
}
%}

class CTracer : CMovableModelEntity {
  name      "Tracer";
  thumbnail "";
  features "ImplementsOnPrecache";

properties:

  1 CEntityPointer m_penLauncher, // who launched it
	2 FLOAT m_tmSpawn = 0.0f,  // when it was spawned
	3 BOOL  m_bSwitchedToModel = FALSE,

components:
  
  //1 model   MODEL_TRACER        "Models\\RailGun\\Projectile\\Ray.mdl",
  //2 texture TEXTURE_TRACER      "Models\\RailGun\\Projectile\\Ray.tex",
  1 model   MODEL_TRACER					"Models\\Tracer\\Tracer.mdl",
  2 texture TEXTURE_TRACER				"Models\\Tracer\\TracerFX.tex",

functions:

  // render particles
  /*void RenderParticles(void) {
    Particles_Tracer_Trail(this);
  };*/

  /* Read from stream. 
  void Read_t( CTStream *istr) // throw char *
  {
    CMovableModelEntity::Read_t(istr);
  }

  void DoMoving() {
    en_plLastPlacement = GetPlacement();  // remember old placement for lerping
  };

  CPlacement3D GetLerpedPlacement(void) const
  {
    FLOAT fLerpFactor;
    if (IsPredictor()) {
      fLerpFactor = _pTimer->GetLerpFactor();
    } else {
      fLerpFactor = _pTimer->GetLerpFactor2();
    }
    return LerpPlacementsPrecise(en_plLastPlacement, en_plPlacement, fLerpFactor);
    //return CMovableEntity::GetLerpedPlacement();
  }

  void PostMoving() 
  {
		CPlacement3D pl = GetLerpedPlacement();
    FLOATmatrix3D m;
    MakeRotationMatrixFast(m, pl.pl_OrientationAngle);
    SetPlacement_internal(pl, m, TRUE);
  }

  void PostMoving() 
  {
		if (!m_bSwitchedToModel) {
			if (_pTimer->GetLerpedCurrentTick() > m_tmSpawn) {
				m_bSwitchedToModel = TRUE;
				SwitchToModel();
			}
		}
  }*/

  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
		//colAmbient = C_vdRED;
    // if time now is inside invisibility time, don't render model
    CModelObject *pmo = GetModelObject();
    if (pmo != NULL) {
			if (_pTimer->GetLerpedCurrentTick() > m_tmSpawn) {
				// make it visible
				pmo->mo_colBlendColor = C_WHITE|CT_OPAQUE;
			} else {
				// make it invisible
				pmo->mo_colBlendColor = 0;
			}
		}
		return FALSE;
	}

procedures:

  // --->>> MAIN
  Main(ELaunchTracer eLaunch) {

    // remember the initial parameters
    ASSERT(eLaunch.penLauncher!=NULL);
    m_penLauncher = eLaunch.penLauncher;

    // initialization
    //InitAsEditorModel();
    InitAsModel();
    SetPhysicsFlags(EPF_PROJECTILE_FLYING);
    SetCollisionFlags(ECF_PROJECTILE_MAGIC);

		GetModelObject()->StretchModel(FLOAT3D(0.13f, 0.13f, 1.8f));
    SetModel(MODEL_TRACER);
		SetModelMainTexture(TEXTURE_TRACER);
		ModelChangeNotify();

		AddToMovers();

    //Particles_Tracer_Trail_Prepare(this);
		m_tmSpawn = _pTimer->CurrentTick() + 0.01f;
		m_bSwitchedToModel = FALSE;

    // add player's forward velocity
    CMovableEntity *penPlayer = (CMovableEntity*)(CEntity*)m_penLauncher;
    FLOAT3D vDirection = penPlayer->en_vCurrentTranslationAbsolute;
    FLOAT3D vFront = -GetRotationMatrix().GetColumn(3);
    FLOAT fSpeedFwd = vDirection%vFront;//ClampDn( vDirection%vFront, 0.0f);
		//CPrintF("fSpeedFwd: %.3f\n", fSpeedFwd);

    // start moving
    LaunchAsFreeProjectile(FLOAT3D(-2.0f+FRnd()*4.0f, -2.0f+FRnd()*4.0f, -(250.0f+fSpeedFwd)), 
			(CMovableEntity*)(CEntity*)m_penLauncher);

		//autowait(0.000001f);

		//SwitchToModel();

    // fly loop
    wait(1.0f) {
      on (EBegin) : { resume; }
      on (ETouch etouch) : { stop; }
      on (ETimer) : { stop; }
    }

		Destroy();

    return;
  }
};
